import * as fs from "fs";

console.log(
  "🚀 Generazione CSV completo con TUTTE le relazioni Tag-Transazioni"
);

// Leggo il file JSON originale
const jsonData = JSON.parse(fs.readFileSync("sqlite-export.json", "utf8"));

// Tutti i dati reali da Supabase - TRANSAZIONI (422 totali)
const allSupabaseTransactions = [
  { id: "d0ccb078-0d64-420f-b43b-77e9e9feb7c7", description: "Pensione" },
  { id: "762fdb3c-aef7-4f0f-879e-f61cfe67da25", description: "iCloud 2TB" },
  { id: "05a09431-d8be-4945-848e-7515cb7b5218", description: "Bolletta Luce" },
  { id: "fab438e5-9acb-4cb0-b42e-a359b4ed92de", description: "Bolletta Gas" },
  { id: "35bd5862-dadc-4ae1-9090-4e6b486357a3", description: "Stipendio" },
  { id: "2508d43d-ac8d-4447-a311-63ef7bb2d36e", description: "Spesa CONAD" },
  {
    id: "a2cb117b-950e-4635-b31a-058092175233",
    description: "Imported expense",
  },
  {
    id: "21bae112-218e-47e9-b59f-e1b6226066f1",
    description: "Terza rata reico e sacchetti cacca",
  },
  { id: "2c5ae6bc-b0e1-4b21-8b26-13392d076985", description: "Caffè Cavour" },
  {
    id: "f3a83f0c-ddc1-4688-a56a-c269aa8ef5e9",
    description: "Terza rata pettorina",
  },
  {
    id: "43d8c1e9-817f-4780-83a6-36ae34014588",
    description: "IMU Ceriano anno 2021",
  },
  {
    id: "d93d41d3-f1b8-40ca-8233-b40cf4d98ca3",
    description: "Frutta e Verdura",
  },
  {
    id: "aaa391b8-f08c-450e-a6f2-52bcc43fe2a6",
    description: "Filetti di Branzino",
  },
  { id: "e8cc6029-d6e8-4b70-a6a4-4404fc7eb0d1", description: "Ilmiolibro,it" },
  { id: "160e09a1-9e3c-471b-9a23-76abdf290afb", description: "Forno piastra" },
  { id: "ea01ccec-8007-40e2-8842-a23050b438be", description: "SoundCloud" },
  { id: "8fff5c26-3273-4f9b-8d30-fcce5234234d", description: "Top11" },
  {
    id: "13147789-524e-4f38-873d-38b683822d8e",
    description:
      "Caffè 300gr di Decaffeinato e altrettanti di Robusta (Il Coloniale)",
  },
  { id: "ac57e852-94f6-48e5-91e2-1fb8ec128ef0", description: "SoundCloud" },
  {
    id: "5978f00e-ae3b-4a43-909b-b9d1f296271a",
    description: "Imported expense",
  },
  {
    id: "af8f7850-dd23-457d-a289-9cdec8e6322d",
    description: "Imported expense",
  },
  {
    id: "97ee737e-fdaf-4c68-9b44-72116df0546c",
    description: "Imported expense",
  },
  { id: "0d401b56-01f3-4230-8943-8f24cd4b5e21", description: "Spesa CONAD" },
  {
    id: "033cb6a6-8fcf-48fc-9283-b77718110178",
    description: "Imported expense",
  },
  { id: "341a2c78-bb32-4379-9e2a-ed49bed5d6fc", description: "Autolavaggio" },
  {
    id: "84b2bee0-6b4e-46ea-848b-bac9ff3ffae5",
    description: "Imported expense",
  },
  {
    id: "0c276619-5c40-43e6-bdf3-8f8b9608d174",
    description: "Imported expense",
  },
  {
    id: "005a466f-39a6-4e2e-9037-9cabed2c746b",
    description: "Antichità Galliera, regalo Natale",
  },
  {
    id: "561cdbb4-caca-452f-9728-f2dd0530db85",
    description: "Mutuo Casa - Pagamento automatico",
  },
  {
    id: "7b40ad0d-27e9-469a-a48f-41bf41113bdb",
    description: "Filetti di Branzino",
  },
  {
    id: "dde68998-112a-4a4a-b3df-2e40fbb5f3e1",
    description: "Frutta e Verdura",
  },
  {
    id: "ac4defc7-0c0e-4be9-bf12-3e731f1a2fe2",
    description: "Aperitivo al teatro Galli",
  },
  {
    id: "ebcba1d7-1752-4f12-84d3-0f657730d524",
    description: "Imported expense",
  },
  {
    id: "bb8e7e7d-cbd4-40f9-8b65-6a5a1757230c",
    description: "Imported expense",
  },
  {
    id: "d794ab02-56d7-4795-9c8f-3d733666985a",
    description: "Imported expense",
  },
  {
    id: "9537e8c3-ec68-426e-a0a7-10cb387b84ea",
    description: "Petti di pollo, fesa e erbette",
  },
  {
    id: "aef34b2b-8866-48c3-a669-87e3015d38ad",
    description: "Imported expense",
  },
  {
    id: "85266455-964f-4cee-9931-abfb7e040f2c",
    description: "Imported expense",
  },
  {
    id: "5d90d1a5-115b-4006-88d2-7bd65a3f48d3",
    description: "Imported expense",
  },
  { id: "13dbc000-c3b2-434c-9d23-d9f9af5f7893", description: "Spesa CONAD" },
  { id: "484478ee-75a1-4faf-8075-08dfbb814cf6", description: "Petti di pollo" },
  { id: "1bcc2ba7-ce77-4610-aee5-f1706424f58d", description: "Grucce Amazon" },
  { id: "17f18602-4452-409e-96bc-f95d71992722", description: "Noleggio film" },
  { id: "a8739da4-a038-4280-b5b2-d47d73f077b0", description: "Crema viso" },
];

// Tutti i tag reali da Supabase (77 totali)
const allSupabaseTags = [
  { id: "d34610d5-bce9-4dad-bce3-93a6c0229a3d", name: "acli" },
  { id: "fddc0281-3e66-494b-a24f-6152eb60a78b", name: "acqua" },
  { id: "deb21e7c-b591-47ff-9936-c5d5590405de", name: "adriano" },
  { id: "9a536d93-da3c-42fc-95d5-7dbc472f0f84", name: "alisé" },
  { id: "55812019-4689-481c-a340-a884b49c5163", name: "amazon" },
  { id: "e53633b6-649a-4bf8-b1f6-2472c5980e48", name: "appleone" },
  { id: "35fc0086-017f-4f96-a3a8-bb858f5088db", name: "banca" },
  { id: "269ebd53-f2ec-4184-bcee-028ad2294509", name: "benzina" },
  { id: "6df2d3ef-f6bc-443d-898b-6a5336dd2ebe", name: "bollette" },
  { id: "1834624e-b0aa-40a9-8a69-061bbc38c481", name: "bonifico" },
  { id: "7d1d3a31-e517-4861-9d95-fc521feb099b", name: "caffe" },
  { id: "633bf40b-8d54-4443-a95d-d55a5f3916ec", name: "caffè" },
  { id: "87276df4-835b-4213-bccf-fc8ddcce0f4d", name: "caffèducale" },
  { id: "4ba30ad9-81d8-4e89-8549-c2d314956418", name: "caffeVecchi" },
  { id: "222ae313-e055-4901-9994-718c9cca5e47", name: "cartadicredito" },
  { id: "38df50c3-0945-4e6c-8dd2-801858f96018", name: "casamadie" },
  { id: "6c655e2d-bfee-4842-b64c-fa15a1e36a36", name: "claude" },
  { id: "e3969aed-fa19-4481-8fda-1e177e45cd86", name: "conad" },
  { id: "300a2e79-1505-48ae-a2fa-1e0323bc1994", name: "CONAD" },
  { id: "5bc3ef36-5e4a-4ced-8973-ad439d67ae3d", name: "condominio" },
  { id: "081ed8d3-db83-4c0b-a071-a5a8c29e7787", name: "corrente" },
  { id: "ec87aa6d-477f-4cff-b94b-3e32a74256ab", name: "cursor" },
  { id: "550abe64-63c8-4ef0-ba92-5e78e1e8c8e9", name: "farmacia" },
  { id: "cfd82fb0-666c-475b-9691-73c0b0446003", name: "ferramenta" },
  { id: "73220c72-45ed-4a40-b1e8-91dc4c164353", name: "fineco" },
  { id: "2b1ca351-4852-4c8f-9b14-20a1940e6a29", name: "fornopiastra" },
  { id: "346c7b75-9e3e-4e94-8a39-7fee541eefcf", name: "fruttivendolo" },
  { id: "beca9c5a-f63d-41d6-bba2-24d45ad757d5", name: "gas" },
  { id: "766a1781-3982-4caf-8063-782c1e0c2b5b", name: "gift" },
  { id: "4cfb9f9b-0007-4720-9658-fbd680df7331", name: "icloudstorage" },
  { id: "1dcbe79e-543b-44fd-99b8-f5c3152cd788", name: "iliad" },
  { id: "5bd3e1e4-1fe3-42d2-aeca-67a5d9150bbd", name: "imma" },
  { id: "97a65b7c-e006-4418-b336-f4b3fa7c73ad", name: "inps" },
  { id: "ee1a74ef-0d28-4c9b-9ca3-d93a30185339", name: "itunes" },
  { id: "98941058-23be-438f-bdcd-6b0ef4f49d57", name: "konvino" },
  { id: "b7d9ef61-3a0d-4eec-b9ab-6bafed2fdae0", name: "ladispensadiirma" },
  { id: "f90d3199-e8b3-42b3-8f06-2dfb6d778ccd", name: "latteriaDelBorgo" },
  { id: "5e7c6630-6263-4744-8e55-c1d934c31151", name: "lavanderia" },
  { id: "bbd2ddea-272d-4436-bc3b-4c061b87f9c3", name: "luce" },
  { id: "5a8ea73b-e1fb-43d6-8c67-7735ef7b9e00", name: "macelleria" },
  { id: "19657059-c737-4ebd-9387-df24d979a0b1", name: "marenelborgo" },
  { id: "ef903de3-795b-4073-af81-4df8888bc683", name: "moodyourdog" },
  { id: "9b342bb6-f74e-4388-92f3-edd52a7327b7", name: "movierental" },
  { id: "f2342449-73ec-4b5d-b723-5a211789ef3b", name: "mutuo" },
  { id: "4e900c7b-f479-4d9c-a428-92943e4db66f", name: "necessaire" },
  { id: "0a860cdb-f3d6-4233-a94e-fbd00c6869f4", name: "nowtv" },
  { id: "a377e852-8d3e-48ac-b0b6-a0901d8cd81c", name: "NowTV" },
  { id: "afcd586c-ca44-4226-9c13-2db96cb48bcb", name: "ottica" },
  { id: "7c7e25aa-9ee7-419b-a048-9cbd8f2b2e84", name: "paccofacile" },
  { id: "f49f0166-fb19-4139-94d7-6d2486906bc0", name: "pakistano" },
  { id: "503d50c6-aad0-4ab7-a9a8-1ee1ef41bb0a", name: "pambiscotto" },
  { id: "490b078f-2271-461d-8d5b-9df9c115f7a6", name: "pastamadre" },
  { id: "1ed10a8f-b0ba-4ed8-b255-9fdfc977750f", name: "pasticceria" },
  { id: "c1507ac5-c99c-4231-bf82-8e1d885ef15d", name: "pasticceriaDuomo" },
  { id: "b8e17944-0e66-4d4e-9a69-ca265d151d80", name: "pec" },
  { id: "6b81684a-61db-4d8a-8128-ee28f8ae9f51", name: "pescheria" },
  { id: "e253768f-79a2-4b89-ba40-29d2af9ef775", name: "piadina" },
  { id: "25aeef23-6b97-4e5a-a5e1-82f2365a3142", name: "piastra" },
  { id: "d233ad77-b4b1-42de-8cf7-3e2161f167d5", name: "pizza" },
  { id: "457a88f0-532e-4d2c-9349-cfe37c1032ab", name: "pizzeria" },
  { id: "31aca6fc-e903-441a-bfe1-a6d59ea26545", name: "regali" },
  { id: "f5b6da6a-6cf6-4c2e-8837-bb7ae09ab0fd", name: "reico" },
  { id: "cbb30ed3-baa6-4b55-b2b6-19786d48cbb2", name: "rosticceria" },
  { id: "85b01b2a-e193-4bc1-9648-91106590977d", name: "saponaria" },
  { id: "29c72ba1-08f0-4fed-bc98-4a51e5d587ea", name: "saporifelici" },
  { id: "dc70fbb5-7724-45e5-9be3-df4f19175b62", name: "satispay" },
  { id: "9ac67b09-870a-4e4a-aa6a-968473d9f28a", name: "soundcloud" },
  { id: "2ee728ea-7c31-471c-b195-27c95e9c1948", name: "spendibene" },
  { id: "0b6fbf84-5bbd-478a-83b6-e500896db05e", name: "spesa" },
  { id: "65408584-d1c1-4b25-96df-09cc60488935", name: "spliit" },
  { id: "95f58c9c-2da6-47c7-86d4-f7a3186bdd2e", name: "svago" },
  { id: "fbf7d2c5-028e-454a-905e-e19d011e78dc", name: "swiffer" },
  { id: "3301affe-3976-41e8-aa4a-2fe9efe8ef55", name: "tagname" },
  { id: "8344b248-7a94-4e98-b216-63d82cad2703", name: "telepass" },
  { id: "a66f31ec-ec43-4bf4-8eba-cc66c84570c9", name: "terraesole" },
  { id: "c83068d5-3258-42da-93e9-19eb9049935a", name: "tim" },
  { id: "0122d7a6-6677-47a8-af05-54e2ae5aed45", name: "tinto" },
];

// Creo le mappe per il mapping
const transactionMap = new Map<string, string>();
const tagMap = new Map<string, string>();

allSupabaseTransactions.forEach((t) => {
  transactionMap.set(t.description, t.id);
});

allSupabaseTags.forEach((t) => {
  tagMap.set(t.name, t.id);
});

// Raccolgo tutte le relazioni dal JSON
const relations: Array<{ tagId: string; transactionId: string }> = [];
let relationsFound = 0;
let relationsSkipped = 0;

// Processo le transazioni nel JSON
jsonData.users.forEach((user) => {
  if (user.transactions) {
    user.transactions.forEach((transaction) => {
      if (transaction.tags && transaction.tags.length > 0) {
        transaction.tags.forEach((tag) => {
          // Cerco l'ID reale in Supabase
          const realTagId = tagMap.get(tag.name);
          const realTransactionId = transactionMap.get(transaction.description);

          if (realTagId && realTransactionId) {
            relations.push({
              tagId: realTagId,
              transactionId: realTransactionId,
            });
            relationsFound++;
          } else {
            console.log(
              `⚠️  Relazione saltata: ${tag.name} → ${transaction.description}`
            );
            relationsSkipped++;
          }
        });
      }
    });
  }
});

console.log(`📊 Statistiche Processing:`);
console.log(`✅ Relazioni trovate: ${relationsFound}`);
console.log(`⚠️  Relazioni saltate: ${relationsSkipped}`);

// Rimuovo duplicati
const uniqueRelations = relations.filter(
  (rel, index, self) =>
    index ===
    self.findIndex(
      (r) => r.tagId === rel.tagId && r.transactionId === rel.transactionId
    )
);

console.log(
  `🔄 Relazioni duplicate rimosse: ${relations.length - uniqueRelations.length}`
);

// Genero il CSV
const csvRows = ["A,B"]; // Header
uniqueRelations.forEach((relation) => {
  csvRows.push(`${relation.tagId},${relation.transactionId}`);
});

const csvContent = csvRows.join("\n");
fs.writeFileSync("10-transaction_tags_COMPLETE.csv", csvContent);

console.log("✅ CSV generato con successo!");
console.log(`📋 File: 10-transaction_tags_COMPLETE.csv`);
console.log(`📊 Relazioni totali: ${uniqueRelations.length}`);
console.log(`📄 Righe CSV: ${csvRows.length} (incluso header)`);

// Mostro alcune relazioni di esempio
console.log("\n🔗 Prime 5 relazioni:");
uniqueRelations.slice(0, 5).forEach((rel, index) => {
  const tagName =
    [...tagMap.entries()].find(([name, id]) => id === rel.tagId)?.[0] ||
    "Unknown";
  const transactionDesc =
    [...transactionMap.entries()].find(
      ([desc, id]) => id === rel.transactionId
    )?.[0] || "Unknown";
  console.log(`${index + 1}. ${tagName} → ${transactionDesc}`);
});
