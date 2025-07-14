// Script per ricreare il CSV con gli ID reali da Supabase
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    },
  },
});

async function fixWithRealIds() {
  console.log("🔍 Verificando ID reali in Supabase...");

  try {
    await prisma.$connect();

    // 1. Ottieni tutti i tag con ID reali da Supabase
    console.log("🏷️ Recuperando tag da Supabase...");
    const supabaseTags = await prisma.tag.findMany({
      select: { id: true, name: true, userId: true },
    });
    console.log(`✅ Trovati ${supabaseTags.length} tag in Supabase`);

    // 2. Ottieni tutte le transazioni con ID reali da Supabase
    console.log("💰 Recuperando transazioni da Supabase...");
    const supabaseTransactions = await prisma.transaction.findMany({
      select: {
        id: true,
        description: true,
        amount: true,
        userId: true,
        date: true,
      },
    });
    console.log(
      `✅ Trovate ${supabaseTransactions.length} transazioni in Supabase`
    );

    // 3. Leggi il JSON originale per capire quali relazioni creare
    console.log("📂 Analizzando relazioni dal JSON export...");
    const jsonPath = path.join(__dirname, "sqlite-export.json");
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // 4. Crea mapping tra dati originali e ID reali in Supabase
    const tagMapping = new Map(); // original_tag_name -> supabase_id
    const transactionMapping = new Map(); // original_transaction_signature -> supabase_id

    // Map tag per nome (assumendo che i nomi siano univoci per utente)
    supabaseTags.forEach((tag) => {
      const key = `${tag.name}_${tag.userId}`;
      tagMapping.set(key, tag.id);
    });

    // Map transazioni per firma unica (amount + description + date + userId)
    supabaseTransactions.forEach((tx) => {
      const signature = `${tx.amount}_${tx.description}_${
        tx.date.toISOString().split("T")[0]
      }_${tx.userId}`;
      transactionMapping.set(signature, tx.id);
    });

    console.log(`📋 Tag mappati: ${tagMapping.size}`);
    console.log(`📋 Transazioni mappate: ${transactionMapping.size}`);

    // 5. Ricrea le relazioni con gli ID reali
    const validCSVLines = ["A,B"]; // Header
    let validRelations = 0;
    let skippedRelations = 0;

    for (const user of data.users) {
      for (const tx of user.transactions) {
        if (tx.tags && tx.tags.length > 0) {
          // Crea firma della transazione originale
          const txSignature = `${tx.amount}_${tx.description}_${
            tx.date.split("T")[0]
          }_${user.id}`;
          const realTransactionId = transactionMapping.get(txSignature);

          if (!realTransactionId) {
            console.log(
              `❌ Transazione non trovata: ${tx.description} (${tx.amount})`
            );
            continue;
          }

          for (const tag of tx.tags) {
            const tagKey = `${tag.name}_${user.id}`;
            const realTagId = tagMapping.get(tagKey);

            if (realTagId) {
              validCSVLines.push(`${realTransactionId},${realTagId}`);
              validRelations++;
            } else {
              skippedRelations++;
              if (skippedRelations <= 3) {
                console.log(
                  `❌ Tag non trovato: ${tag.name} per user ${user.id}`
                );
              }
            }
          }
        }
      }
    }

    // 6. Salva CSV con ID reali
    const csvContent = validCSVLines.join("\n");
    const csvDir = path.join(__dirname, "csv-export");
    const realIdsCsvPath = path.join(
      csvDir,
      "10-transaction_tags_REAL_IDS.csv"
    );
    fs.writeFileSync(realIdsCsvPath, csvContent);

    console.log("");
    console.log("📊 RISULTATI FINALI:");
    console.log(`   ✅ Relazioni con ID reali: ${validRelations}`);
    console.log(`   ❌ Relazioni skippate: ${skippedRelations}`);
    console.log(`   💾 Salvato: 10-transaction_tags_REAL_IDS.csv`);

    // 7. Mostra alcuni esempi per verificare
    console.log("");
    console.log("🔍 PRIMI 5 ESEMPI:");
    validCSVLines.slice(1, 6).forEach((line, i) => {
      const [txId, tagId] = line.split(",");
      console.log(`   ${i + 1}. Transaction ID: ${txId}, Tag ID: ${tagId}`);
    });

    await prisma.$disconnect();

    console.log("");
    console.log("🚀 PROSSIMO PASSO:");
    console.log("Importa il file: 10-transaction_tags_REAL_IDS.csv");
    console.log("Questo usa gli ID REALI da Supabase!");
  } catch (error) {
    console.error("❌ Errore:", error);
    await prisma.$disconnect();
  }
}

fixWithRealIds();
