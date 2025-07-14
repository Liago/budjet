import * as fs from "fs";

// Dati reali estratti da Supabase
const transactionMap = new Map([
  // Dati reali delle transazioni da Supabase
  ["Pensione", "d0ccb078-0d64-420f-b43b-77e9e9feb7c7"],
  ["iCloud 2TB", "762fdb3c-aef7-4f0f-879e-f61cfe67da25"],
  ["Bolletta Luce", "05a09431-d8be-4945-848e-7515cb7b5218"],
  ["Bolletta Gas", "fab438e5-9acb-4cb0-b42e-a359b4ed92de"],
  ["Stipendio", "35bd5862-dadc-4ae1-9090-4e6b486357a3"],
  ["Spesa CONAD", "2508d43d-ac8d-4447-a311-63ef7bb2d36e"],
  ["Forno piastra", "160e09a1-9e3c-471b-9a23-76abdf290afb"],
  ["Caffè Cavour", "2c5ae6bc-b0e1-4b21-8b26-13392d076985"],
  ["Crema viso", "a8739da4-a038-4280-b5b2-d47d73f077b0"],
  // ... aggiungerò via via tutti i mapping necessari
]);

const tagMap = new Map([
  // Tutti i tag da Supabase
  ["conad", "e3969aed-fa19-4481-8fda-1e177e45cd86"],
  ["fornopiastra", "2b1ca351-4852-4c8f-9b14-20a1940e6a29"],
  ["caffè", "633bf40b-8d54-4443-a95d-d55a5f3916ec"],
  ["pensione", ""], // da trovare
  ["icloud", ""], // da trovare
  ["bollette", "6df2d3ef-f6bc-443d-898b-6a5336dd2ebe"],
  ["gas", "beca9c5a-f63d-41d6-bba2-24d45ad757d5"],
  ["luce", "bbd2ddea-272d-4436-bc3b-4c061b87f9c3"],
  ["stipendio", ""], // da trovare
  ["spesa", "0b6fbf84-5bbd-478a-83b6-e500896db05e"],
  // ... tutti gli altri tag
]);

// Leggi il file JSON originale
const jsonData = JSON.parse(fs.readFileSync("sqlite-export.json", "utf8"));

// Funzione per trovare l'ID di una transazione per descrizione
function findTransactionId(description: string): string | null {
  // Prova prima il mapping diretto
  if (transactionMap.has(description)) {
    return transactionMap.get(description)!;
  }

  // Altrimenti cerca una corrispondenza parziale
  for (const [desc, id] of transactionMap.entries()) {
    if (desc.includes(description) || description.includes(desc)) {
      return id;
    }
  }

  console.warn(`Transaction not found: ${description}`);
  return null;
}

// Funzione per trovare l'ID di un tag per nome
function findTagId(tagName: string): string | null {
  if (tagMap.has(tagName.toLowerCase())) {
    return tagMap.get(tagName.toLowerCase())!;
  }

  console.warn(`Tag not found: ${tagName}`);
  return null;
}

// Processa le relazioni _TagToTransaction
const csvRows: string[] = ["A,B"]; // Header

console.log("Processando relazioni tag-transazioni...");
let validRelations = 0;
let totalRelations = 0;

for (const relation of jsonData._TagToTransaction) {
  totalRelations++;

  // Trova la transazione e il tag corrispondenti
  const transaction = jsonData.Transaction.find(
    (t: any) => t.id === relation.B
  );
  const tag = jsonData.Tag.find((t: any) => t.id === relation.A);

  if (!transaction || !tag) {
    console.warn(`Relation skipped: Transaction or Tag not found`);
    continue;
  }

  const transactionId = findTransactionId(transaction.description);
  const tagId = findTagId(tag.name);

  if (transactionId && tagId) {
    csvRows.push(`${tagId},${transactionId}`);
    validRelations++;
    console.log(`✓ ${tag.name} -> ${transaction.description}`);
  } else {
    console.warn(`⚠ Skipped: ${tag.name} -> ${transaction.description}`);
  }
}

// Scrivi il file CSV
fs.writeFileSync("10-transaction_tags_COMPLETE.csv", csvRows.join("\n"));

console.log(`\n🎯 CSV generato con successo!`);
console.log(`📊 Statistiche:`);
console.log(`   - Relazioni totali nel JSON: ${totalRelations}`);
console.log(`   - Relazioni valide nel CSV: ${validRelations}`);
console.log(`   - File salvato: 10-transaction_tags_COMPLETE.csv`);
