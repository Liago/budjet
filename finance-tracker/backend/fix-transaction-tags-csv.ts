// Script per correggere il CSV delle relazioni Transaction-Tag
import * as fs from "fs";
import * as path from "path";

function fixTransactionTagsCSV() {
  console.log("🔧 Correggendo transaction_tags.csv per Prisma...");

  // Leggi il file JSON originale
  const jsonPath = path.join(__dirname, "sqlite-export.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // Crea il CSV corretto con colonne A e B (convenzione Prisma)
  const csvLines = ["A,B"]; // Header con convenzione Prisma standard

  let relationCount = 0;

  for (const user of data.users) {
    for (const tx of user.transactions) {
      if (tx.tags && tx.tags.length > 0) {
        for (const tag of tx.tags) {
          // A = Transaction ID, B = Tag ID (convenzione Prisma)
          csvLines.push(`${tx.id},${tag.id}`);
          relationCount++;
        }
      }
    }
  }

  // Salva il CSV corretto
  const csvContent = csvLines.join("\n");
  const csvDir = path.join(__dirname, "csv-export");
  fs.writeFileSync(
    path.join(csvDir, "10-transaction_tags_FIXED.csv"),
    csvContent
  );

  console.log(
    `✅ Creato 10-transaction_tags_FIXED.csv con ${relationCount} relazioni`
  );
  console.log("📋 Header: A,B (convenzione Prisma)");

  // Crea anche una versione alternativa con nomi espliciti
  const csvLinesExplicit = ["transactionId,tagId"];

  for (const user of data.users) {
    for (const tx of user.transactions) {
      if (tx.tags && tx.tags.length > 0) {
        for (const tag of tx.tags) {
          csvLinesExplicit.push(`${tx.id},${tag.id}`);
        }
      }
    }
  }

  const csvContentExplicit = csvLinesExplicit.join("\n");
  fs.writeFileSync(
    path.join(csvDir, "10-transaction_tags_EXPLICIT.csv"),
    csvContentExplicit
  );
  console.log(
    `✅ Creato anche 10-transaction_tags_EXPLICIT.csv con nomi espliciti`
  );

  console.log("");
  console.log("🎯 PROVA ENTRAMBE LE VERSIONI:");
  console.log("1. Prova prima: 10-transaction_tags_FIXED.csv (colonne A,B)");
  console.log(
    "2. Se non funziona: 10-transaction_tags_EXPLICIT.csv (colonne transactionId,tagId)"
  );
  console.log("");
  console.log("💡 COME VERIFICARE LA STRUTTURA CORRETTA:");
  console.log("1. Vai su Supabase Dashboard → Table Editor");
  console.log("2. Cerca la tabella _TagToTransaction");
  console.log("3. Guarda i nomi delle colonne effettive");
  console.log("4. Usa il CSV che corrisponde ai nomi delle colonne");
}

fixTransactionTagsCSV();
