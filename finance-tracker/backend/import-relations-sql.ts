// Script per importare relazioni transaction-tag direttamente tramite SQL
import { PrismaClient, Prisma } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    },
  },
});

async function importRelationsSQL() {
  console.log("🔄 Importando relazioni Transaction-Tag tramite SQL...");

  try {
    await prisma.$connect();

    // 1. Ottieni tutti i tag da Supabase
    console.log("🏷️ Recuperando tag da Supabase...");
    const supabaseTags = await prisma.tag.findMany({
      select: { id: true, name: true, userId: true },
    });
    console.log(`✅ Tag trovati: ${supabaseTags.length}`);

    // 2. Ottieni tutte le transazioni da Supabase
    console.log("💰 Recuperando transazioni da Supabase...");
    const supabaseTransactions = await prisma.transaction.findMany({
      select: {
        id: true,
        description: true,
        amount: true,
        userId: true,
        date: true,
        categoryId: true,
      },
    });
    console.log(`✅ Transazioni trovate: ${supabaseTransactions.length}`);

    // 3. Leggi i dati originali dal JSON
    console.log("📂 Analizzando dati originali...");
    const jsonPath = path.join(__dirname, "sqlite-export.json");
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // 4. Crea mappings
    const tagMapping = new Map();
    const transactionMapping = new Map();

    // Mappa tag per nome + userId
    supabaseTags.forEach((tag) => {
      const key = `${tag.name}_${tag.userId}`;
      tagMapping.set(key, tag.id);
    });

    // Mappa transazioni per firma univoca
    supabaseTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      const dateStr =
        date.getFullYear() +
        "-" +
        String(date.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(date.getDate()).padStart(2, "0");
      const signature = `${tx.amount}_${tx.description}_${dateStr}_${tx.userId}`;
      transactionMapping.set(signature, tx.id);
    });

    console.log(`📋 Tag mappati: ${tagMapping.size}`);
    console.log(`📋 Transazioni mappate: ${transactionMapping.size}`);

    // 5. Prepara relazioni per inserimento
    const relations = [];
    let validRelations = 0;
    let skippedRelations = 0;

    for (const user of data.users) {
      for (const tx of user.transactions) {
        if (tx.tags && tx.tags.length > 0) {
          // Crea firma della transazione originale (formato YYYY-MM-DD)
          const dateStr = tx.date.split("T")[0];
          const txSignature = `${tx.amount}_${tx.description}_${dateStr}_${user.id}`;
          const realTransactionId = transactionMapping.get(txSignature);

          if (!realTransactionId) {
            skippedRelations++;
            if (skippedRelations <= 3) {
              console.log(
                `❌ Transazione non trovata: ${tx.description} (${tx.amount})`
              );
            }
            continue;
          }

          for (const tag of tx.tags) {
            const tagKey = `${tag.name}_${user.id}`;
            const realTagId = tagMapping.get(tagKey);

            if (realTagId) {
              relations.push({
                transactionId: realTransactionId,
                tagId: realTagId,
              });
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

    console.log("");
    console.log("📊 RELAZIONI DA INSERIRE:");
    console.log(`   ✅ Relazioni valide: ${validRelations}`);
    console.log(`   ❌ Relazioni skippate: ${skippedRelations}`);

    if (relations.length === 0) {
      console.log("⚠️ Nessuna relazione da inserire!");
      return;
    }

    // 6. Inserisci tramite SQL (batch di 100)
    console.log("");
    console.log("💾 Inserendo relazioni in Supabase...");

    const batchSize = 100;
    let inserted = 0;

    for (let i = 0; i < relations.length; i += batchSize) {
      const batch = relations.slice(i, i + batchSize);
      const values = batch
        .map((r) => `('${r.transactionId}', '${r.tagId}')`)
        .join(", ");

      await prisma.$executeRaw`
        INSERT INTO "_TagToTransaction" ("A", "B") 
        VALUES ${Prisma.raw(values)}
        ON CONFLICT DO NOTHING;
      `;

      inserted += batch.length;
      console.log(
        `   📥 Inserite ${inserted}/${relations.length} relazioni...`
      );
    }

    // 7. Verifica risultato
    const finalCount =
      await prisma.$queryRaw`SELECT COUNT(*) as count FROM "_TagToTransaction"`;

    console.log("");
    console.log("🎉 IMPORT COMPLETATO:");
    console.log(`   📊 Relazioni inserite: ${inserted}`);
    console.log(`   🔍 Totale in tabella: ${finalCount[0].count}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Errore durante import:", error);
    await prisma.$disconnect();
  }
}

importRelationsSQL();
