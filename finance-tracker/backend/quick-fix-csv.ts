// Quick fix per il CSV transaction-tags senza connettersi a Supabase
import * as fs from "fs";
import * as path from "path";

function quickFixCSV() {
  console.log("🔧 Quick fix del CSV transaction-tags...");

  // 1. Leggi i CSV di transazioni e tag per ottenere gli ID validi
  const csvDir = path.join(__dirname, "csv-export");

  // Leggi transazioni importate
  const transactionsCSV = fs.readFileSync(
    path.join(csvDir, "09-transactions.csv"),
    "utf8"
  );
  const transactionLines = transactionsCSV.split("\n").slice(1); // Salta header
  const validTransactionIds = new Set();

  transactionLines.forEach((line) => {
    if (line.trim()) {
      const id = line.split(",")[0].replace(/"/g, ""); // Primo campo = ID
      validTransactionIds.add(id);
    }
  });

  // Leggi tag importati
  const tagsCSV = fs.readFileSync(path.join(csvDir, "03-tags.csv"), "utf8");
  const tagLines = tagsCSV.split("\n").slice(1); // Salta header
  const validTagIds = new Set();

  tagLines.forEach((line) => {
    if (line.trim()) {
      const id = line.split(",")[0].replace(/"/g, ""); // Primo campo = ID
      validTagIds.add(id);
    }
  });

  console.log(`✅ Transazioni valide: ${validTransactionIds.size}`);
  console.log(`✅ Tag validi: ${validTagIds.size}`);

  // 2. Filtra il CSV delle relazioni
  const relationCSV = fs.readFileSync(
    path.join(csvDir, "10-transaction_tags_FIXED.csv"),
    "utf8"
  );
  const relationLines = relationCSV.split("\n");

  const validLines = ["A,B"]; // Header
  let validRelations = 0;
  let skippedRelations = 0;

  for (let i = 1; i < relationLines.length; i++) {
    const line = relationLines[i].trim();
    if (!line) continue;

    const [transactionId, tagId] = line.split(",");

    if (validTransactionIds.has(transactionId) && validTagIds.has(tagId)) {
      validLines.push(line);
      validRelations++;
    } else {
      skippedRelations++;
      if (skippedRelations <= 3) {
        console.log(`❌ Skipping: Transaction ${transactionId}, Tag ${tagId}`);
      }
    }
  }

  // 3. Salva CSV pulito
  const cleanCSV = validLines.join("\n");
  fs.writeFileSync(
    path.join(csvDir, "10-transaction_tags_CLEAN.csv"),
    cleanCSV
  );

  console.log("");
  console.log("📊 RISULTATI:");
  console.log(`   ✅ Relazioni valide: ${validRelations}`);
  console.log(`   ❌ Relazioni skippate: ${skippedRelations}`);
  console.log(`   💾 Salvato: 10-transaction_tags_CLEAN.csv`);

  console.log("");
  console.log("🚀 PROSSIMO PASSO:");
  console.log("Importa il file: 10-transaction_tags_CLEAN.csv");
  console.log("Questo dovrebbe funzionare senza errori!");
}

quickFixCSV();
