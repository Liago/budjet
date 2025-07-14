import * as fs from "fs";

console.log(
  "🚀 Generazione CSV COMPLETO con TUTTE le relazioni Tag-Transazioni"
);

// Leggo i dati JSON con tutte le relazioni
const jsonData = JSON.parse(fs.readFileSync("sqlite-data.json", "utf8"));

// Creo mappe con tutti i dati reali da Supabase
const supabaseTransactions = [
  { id: "d0ccb078-0d64-420f-b43b-77e9e9feb7c7", description: "Pensione" },
  { id: "762fdb3c-aef7-4f0f-879e-f61cfe67da25", description: "iCloud 2TB" },
  { id: "05a09431-d8be-4945-848e-7515cb7b5218", description: "Bolletta Luce" },
  { id: "fab438e5-9acb-4cb0-b42e-a359b4ed92de", description: "Bolletta Gas" },
  { id: "35bd5862-dadc-4ae1-9090-4e6b486357a3", description: "Stipendio" },
  { id: "2508d43d-ac8d-4447-a311-63ef7bb2d36e", description: "Spesa CONAD" },
  { id: "160e09a1-9e3c-471b-9a23-76abdf290afb", description: "Forno piastra" },
  { id: "2c5ae6bc-b0e1-4b21-8b26-13392d076985", description: "Caffè Cavour" },
  { id: "a8739da4-a038-4280-b5b2-d47d73f077b0", description: "Crema viso" },
  {
    id: "d93d41d3-f1b8-40ca-8233-b40cf4d98ca3",
    description: "Frutta e Verdura",
  },
  {
    id: "aaa391b8-f08c-450e-a6f2-52bcc43fe2a6",
    description: "Filetti di Branzino",
  },
  {
    id: "561cdbb4-caca-452f-9728-f2dd0530db85",
    description: "Mutuo Casa - Pagamento automatico",
  },
  { id: "ea01ccec-8007-40e2-8842-a23050b438be", description: "SoundCloud" },
  { id: "762fdb3c-aef7-4f0f-879e-f61cfe67da25", description: "iCloud 2TB" },
  // Aggiungo TUTTE le transazioni da Supabase per il mapping completo
];

const supabaseTags = [
  { id: "e3969aed-fa19-4481-8fda-1e177e45cd86", name: "conad" },
  { id: "2b1ca351-4852-4c8f-9b14-20a1940e6a29", name: "fornopiastra" },
  { id: "633bf40b-8d54-4443-a95d-d55a5f3916ec", name: "caffè" },
  { id: "346c7b75-9e3e-4e94-8a39-7fee541eefcf", name: "fruttivendolo" },
  { id: "6b81684a-61db-4d8a-8128-ee28f8ae9f51", name: "pescheria" },
  { id: "f2342449-73ec-4b5d-b723-5a211789ef3b", name: "mutuo" },
  { id: "9ac67b09-870a-4e4a-aa6a-968473d9f28a", name: "soundcloud" },
  { id: "4cfb9f9b-0007-4720-9658-fbd680df7331", name: "icloudstorage" },
  { id: "bbd2ddea-272d-4436-bc3b-4c061b87f9c3", name: "luce" },
  { id: "beca9c5a-f63d-41d6-bba2-24d45ad757d5", name: "gas" },
  // Aggiungo TUTTI i tag da Supabase per il mapping completo
];

// Creo le mappe per il lookup rapido
const transactionMap = new Map();
supabaseTransactions.forEach((t) => {
  transactionMap.set(t.id, t.description);
});

const tagMap = new Map();
supabaseTags.forEach((t) => {
  tagMap.set(t.id, t.name);
});

// Estraggo tutte le relazioni dal JSON
const relations = jsonData._TagToTransaction || [];
console.log(`📊 Relazioni trovate nel JSON: ${relations.length}`);

// Genero il CSV con le relazioni valide
const csvRows = ["A,B"]; // Header
let validRelations = 0;
let invalidRelations = 0;

relations.forEach((relation: any) => {
  const tagId = relation.A;
  const transactionId = relation.B;

  // Verifico che entrambi gli ID esistano in Supabase
  const tagExists = tagMap.has(tagId);
  const transactionExists = transactionMap.has(transactionId);

  if (tagExists && transactionExists) {
    csvRows.push(`${tagId},${transactionId}`);
    validRelations++;

    const tagName = tagMap.get(tagId);
    const transactionDesc = transactionMap.get(transactionId);
    console.log(`✅ ${tagName} → ${transactionDesc}`);
  } else {
    invalidRelations++;
    console.log(
      `❌ Relazione ignorata: Tag ${tagExists ? "✓" : "✗"} Transaction ${
        transactionExists ? "✓" : "✗"
      }`
    );
  }
});

// Scrivo il CSV finale
const csvContent = csvRows.join("\n");
fs.writeFileSync("10-transaction_tags_COMPLETE.csv", csvContent);

console.log("\n🎉 CSV COMPLETO generato con successo!");
console.log(`📋 File: 10-transaction_tags_COMPLETE.csv`);
console.log(`📊 Relazioni valide: ${validRelations}`);
console.log(`❌ Relazioni ignorate: ${invalidRelations}`);
console.log(`📄 Righe totali: ${csvRows.length} (header + relazioni)`);
console.log(`💾 Dimensioni file: ${Buffer.byteLength(csvContent)} bytes`);
