import * as fs from "fs";

console.log(
  "🚀 Generazione CSV COMPLETO con TUTTE le relazioni Tag-Transazioni"
);

// Leggo i dati JSON con tutte le relazioni
const jsonData = JSON.parse(fs.readFileSync("sqlite-data.json", "utf8"));

// Dati reali da Supabase - Solo gli ID che esistono effettivamente
const supabaseTransactionIds = new Set([
  "d0ccb078-0d64-420f-b43b-77e9e9feb7c7", // Pensione
  "762fdb3c-aef7-4f0f-879e-f61cfe67da25", // iCloud 2TB
  "05a09431-d8be-4945-848e-7515cb7b5218", // Bolletta Luce
  "fab438e5-9acb-4cb0-b42e-a359b4ed92de", // Bolletta Gas
  "35bd5862-dadc-4ae1-9090-4e6b486357a3", // Stipendio
  "2508d43d-ac8d-4447-a311-63ef7bb2d36e", // Spesa CONAD
  "160e09a1-9e3c-471b-9a23-76abdf290afb", // Forno piastra
  "2c5ae6bc-b0e1-4b21-8b26-13392d076985", // Caffè Cavour
  "a8739da4-a038-4280-b5b2-d47d73f077b0", // Crema viso
  "d93d41d3-f1b8-40ca-8233-b40cf4d98ca3", // Frutta e Verdura
  "aaa391b8-f08c-450e-a6f2-52bcc43fe2a6", // Filetti di Branzino
  "561cdbb4-caca-452f-9728-f2dd0530db85", // Mutuo Casa
  "ea01ccec-8007-40e2-8842-a23050b438be", // SoundCloud
  "fe15df5c-78cb-48d0-a21a-e73cbf5c7a2a", // Filetti di Branzino (il Corallo)
  "e9a0b70f-542f-4625-a1cb-902dff503236", // Frutta e Verdura
  "403f9112-9579-4eac-b78e-da6cc2dcfa03", // Frutta e Verdura
  "28acea7e-22bb-4f56-adb9-0632904014ab", // Filetti di Branzino (il Corallo)
  "337c9876-b62d-411a-afac-f88d959efa7b", // piada, stracchino e rucola
  "1de4172b-737b-4b8a-906b-8f3413258c29", // Caffè 300gr
  "58bad7b7-ff1e-45f5-8f54-97dba8d54e25", // Frutta e Verdura
  "311cebb5-8892-469e-9169-e88e165c34c3", // Imported expense
  "fa3cd150-930c-429b-9796-b65125a5beb9", // Imported expense
  "03520b06-d37e-4a4a-880b-4d8e8aac5a06", // Swiffer
  "e111f7e9-a5b2-4424-9142-73b6eb0983c9", // Imported expense
  "66339278-1197-4fbc-8602-5275a75329f7", // pollo e fesa tacchino
  "7411cdd1-79d3-4e87-b8a4-49c2769969a0", // Spesa CONAD
  "50f104e5-5782-49cb-8472-7bc7043772c1", // Imported expense
  "54a59369-3a7a-4c9e-a99c-14d69c2ff5d8", // Imported expense
  "a5a4f71e-e743-4329-a794-e928122bba1f", // Imported expense
  "8b3b77f4-906b-4b7f-8498-9cac7f612d11", // Filetti di Branzino
  "883d0a50-e305-44c3-92af-77bcd8f33fea", // Frutta e Verdura
  "b69a718b-9de2-4836-923d-d7e4af0355d7", // Spesa CONAD
]);

const supabaseTagIds = new Set([
  "e3969aed-fa19-4481-8fda-1e177e45cd86", // conad
  "2b1ca351-4852-4c8f-9b14-20a1940e6a29", // fornopiastra
  "633bf40b-8d54-4443-a95d-d55a5f3916ec", // caffè
  "346c7b75-9e3e-4e94-8a39-7fee541eefcf", // fruttivendolo
  "6b81684a-61db-4d8a-8128-ee28f8ae9f51", // pescheria
  "f2342449-73ec-4b5d-b723-5a211789ef3b", // mutuo
  "9ac67b09-870a-4e4a-aa6a-968473d9f28a", // soundcloud
  "4cfb9f9b-0007-4720-9658-fbd680df7331", // icloudstorage
  "bbd2ddea-272d-4436-bc3b-4c061b87f9c3", // luce
  "beca9c5a-f63d-41d6-bba2-24d45ad757d5", // gas
  "a66f31ec-ec43-4bf4-8eba-cc66c84570c9", // terraesole
  "7d1d3a31-e517-4861-9d95-fc521feb099b", // caffe
  "0122d7a6-6677-47a8-af05-54e2ae5aed45", // tinto
  "1ed10a8f-b0ba-4ed8-b255-9fdfc977750f", // pasticceria
  "5a8ea73b-e1fb-43d6-8c67-7735ef7b9e00", // macelleria
  "d233ad77-b4b1-42de-8cf7-3e2161f167d5", // pizza
  "fbf7d2c5-028e-454a-905e-e19d011e78dc", // swiffer
  "dc70fbb5-7724-45e5-9be3-df4f19175b62", // satispay
  "2ee728ea-7c31-471c-b195-27c95e9c1948", // spendibene
  "afcd586c-ca44-4226-9c13-2db96cb48bcb", // ottica
  "97a65b7c-e006-4418-b336-f4b3fa7c73ad", // inps
  "269ebd53-f2ec-4184-bcee-028ad2294509", // benzina
  "f5b6da6a-6cf6-4c2e-8837-bb7ae09ab0fd", // reico
  "cbb30ed3-baa6-4b55-b2b6-19786d48cbb2", // rosticceria
  "fddc0281-3e66-494b-a24f-6152eb60a78b", // acqua
  "300a2e79-1505-48ae-a2fa-1e0323bc1994", // CONAD
]);

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
  const tagExists = supabaseTagIds.has(tagId);
  const transactionExists = supabaseTransactionIds.has(transactionId);

  if (tagExists && transactionExists) {
    csvRows.push(`${tagId},${transactionId}`);
    validRelations++;
    console.log(
      `✅ Tag: ${tagId.slice(0, 8)}... → Transaction: ${transactionId.slice(
        0,
        8
      )}...`
    );
  } else {
    invalidRelations++;
    if (validRelations < 5) {
      // Mostro solo i primi errori per non intasare
      console.log(
        `❌ Relazione ignorata: Tag ${tagExists ? "✓" : "✗"} Transaction ${
          transactionExists ? "✓" : "✗"
        }`
      );
    }
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

// Mostro un campione del CSV
console.log("\n📄 Campione CSV (prime 10 righe):");
console.log(csvRows.slice(0, 11).join("\n"));
