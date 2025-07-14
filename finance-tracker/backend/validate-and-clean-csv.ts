// Script per validare e pulire il CSV delle relazioni Transaction-Tag
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

async function validateAndCleanCSV() {
  console.log("🔍 Validando dati Transaction-Tag con Supabase...");

  try {
    await prisma.$connect();

    // 1. Ottieni tutti gli ID delle transazioni esistenti in Supabase
    console.log("📊 Recuperando transazioni da Supabase...");
    const existingTransactions = await prisma.transaction.findMany({
      select: { id: true },
    });
    const transactionIds = new Set(existingTransactions.map((t) => t.id));
    console.log(`✅ Trovate ${transactionIds.size} transazioni in Supabase`);

    // 2. Ottieni tutti gli ID dei tag esistenti in Supabase
    console.log("🏷️ Recuperando tag da Supabase...");
    const existingTags = await prisma.tag.findMany({
      select: { id: true },
    });
    const tagIds = new Set(existingTags.map((t) => t.id));
    console.log(`✅ Trovati ${tagIds.size} tag in Supabase`);

    // 3. Leggi il file JSON originale per ricreare le relazioni
    console.log("📂 Analizzando relazioni dal JSON export...");
    const jsonPath = path.join(__dirname, "sqlite-export.json");
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    let totalRelations = 0;
    let validRelations = 0;
    let invalidTransactionIds = new Set();
    let invalidTagIds = new Set();

    const validCSVLines = ["A,B"]; // Header

    // 4. Valida ogni relazione
    for (const user of data.users) {
      for (const tx of user.transactions) {
        if (tx.tags && tx.tags.length > 0) {
          for (const tag of tx.tags) {
            totalRelations++;

            const transactionExists = transactionIds.has(tx.id);
            const tagExists = tagIds.has(tag.id);

            if (transactionExists && tagExists) {
              // Relazione valida
              validCSVLines.push(`${tx.id},${tag.id}`);
              validRelations++;
            } else {
              // Relazione invalida - traccia gli ID mancanti
              if (!transactionExists) {
                invalidTransactionIds.add(tx.id);
              }
              if (!tagExists) {
                invalidTagIds.add(tag.id);
              }
            }
          }
        }
      }
    }

    // 5. Genera statistiche
    console.log("");
    console.log("📊 RISULTATI VALIDAZIONE:");
    console.log(`   🔗 Relazioni totali nel JSON: ${totalRelations}`);
    console.log(`   ✅ Relazioni valide: ${validRelations}`);
    console.log(`   ❌ Relazioni invalide: ${totalRelations - validRelations}`);
    console.log(`   🔍 Transaction ID mancanti: ${invalidTransactionIds.size}`);
    console.log(`   🏷️ Tag ID mancanti: ${invalidTagIds.size}`);

    // 6. Mostra alcuni esempi di ID mancanti
    if (invalidTransactionIds.size > 0) {
      console.log("");
      console.log("❌ ESEMPI TRANSACTION ID MANCANTI:");
      Array.from(invalidTransactionIds)
        .slice(0, 3)
        .forEach((id) => {
          console.log(`   ${id}`);
        });
    }

    if (invalidTagIds.size > 0) {
      console.log("");
      console.log("❌ ESEMPI TAG ID MANCANTI:");
      Array.from(invalidTagIds)
        .slice(0, 3)
        .forEach((id) => {
          console.log(`   ${id}`);
        });
    }

    // 7. Salva CSV pulito
    const csvContent = validCSVLines.join("\n");
    const csvDir = path.join(__dirname, "csv-export");
    const cleanCsvPath = path.join(csvDir, "10-transaction_tags_CLEAN.csv");
    fs.writeFileSync(cleanCsvPath, csvContent);

    console.log("");
    console.log(`✅ CSV pulito salvato: 10-transaction_tags_CLEAN.csv`);
    console.log(`📊 Contiene ${validRelations} relazioni valide`);

    // 8. Verifica finale
    console.log("");
    console.log("🔍 VERIFICA FINALE:");
    console.log(`   📥 Transazioni in Supabase: ${transactionIds.size}`);
    console.log(`   🏷️ Tag in Supabase: ${tagIds.size}`);
    console.log(`   🔗 Relazioni da importare: ${validRelations}`);

    await prisma.$disconnect();

    console.log("");
    console.log("🚀 PROSSIMO PASSO:");
    console.log("Importa il file: 10-transaction_tags_CLEAN.csv");
    console.log("Questo dovrebbe funzionare senza errori di foreign key!");
  } catch (error) {
    console.error("❌ Errore durante validazione:", error);
    await prisma.$disconnect();
  }
}

validateAndCleanCSV();
