// Script per creare CSV finale usando API MCP Supabase
import * as fs from "fs";
import * as path from "path";

// Dati dei tag da Supabase (copiati dalla query MCP)
const supabaseTags = [
  {
    id: "d34610d5-bce9-4dad-bce3-93a6c0229a3d",
    name: "acli",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "fddc0281-3e66-494b-a24f-6152eb60a78b",
    name: "acqua",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "deb21e7c-b591-47ff-9936-c5d5590405de",
    name: "adriano",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "9a536d93-da3c-42fc-95d5-7dbc472f0f84",
    name: "alisé",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "55812019-4689-481c-a340-a884b49c5163",
    name: "amazon",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "e53633b6-649a-4bf8-b1f6-2472c5980e48",
    name: "appleone",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "35fc0086-017f-4f96-a3a8-bb858f5088db",
    name: "banca",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "269ebd53-f2ec-4184-bcee-028ad2294509",
    name: "benzina",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "6df2d3ef-f6bc-443d-898b-6a5336dd2ebe",
    name: "bollette",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "1834624e-b0aa-40a9-8a69-061bbc38c481",
    name: "bonifico",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "7d1d3a31-e517-4861-9d95-fc521feb099b",
    name: "caffe",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "633bf40b-8d54-4443-a95d-d55a5f3916ec",
    name: "caffè",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "87276df4-835b-4213-bccf-fc8ddcce0f4d",
    name: "caffèducale",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "4ba30ad9-81d8-4e89-8549-c2d314956418",
    name: "caffeVecchi",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "222ae313-e055-4901-9994-718c9cca5e47",
    name: "cartadicredito",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "38df50c3-0945-4e6c-8dd2-801858f96018",
    name: "casamadie",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "6c655e2d-bfee-4842-b64c-fa15a1e36a36",
    name: "claude",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "e3969aed-fa19-4481-8fda-1e177e45cd86",
    name: "conad",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "300a2e79-1505-48ae-a2fa-1e0323bc1994",
    name: "CONAD",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "5bc3ef36-5e4a-4ced-8973-ad439d67ae3d",
    name: "condominio",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "081ed8d3-db83-4c0b-a071-a5a8c29e7787",
    name: "corrente",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "ec87aa6d-477f-4cff-b94b-3e32a74256ab",
    name: "cursor",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "550abe64-63c8-4ef0-ba92-5e78e1e8c8e9",
    name: "farmacia",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "cfd82fb0-666c-475b-9691-73c0b0446003",
    name: "ferramenta",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "73220c72-45ed-4a40-b1e8-91dc4c164353",
    name: "fineco",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "2b1ca351-4852-4c8f-9b14-20a1940e6a29",
    name: "fornopiastra",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "346c7b75-9e3e-4e94-8a39-7fee541eefcf",
    name: "fruttivendolo",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "beca9c5a-f63d-41d6-bba2-24d45ad757d5",
    name: "gas",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "766a1781-3982-4caf-8063-782c1e0c2b5b",
    name: "gift",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "4cfb9f9b-0007-4720-9658-fbd680df7331",
    name: "icloudstorage",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "1dcbe79e-543b-44fd-99b8-f5c3152cd788",
    name: "iliad",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "5bd3e1e4-1fe3-42d2-aeca-67a5d9150bbd",
    name: "imma",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "97a65b7c-e006-4418-b336-f4b3fa7c73ad",
    name: "inps",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "ee1a74ef-0d28-4c9b-9ca3-d93a30185339",
    name: "itunes",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  {
    id: "98941058-23be-438f-bdcd-6b0ef4f49d57",
    name: "konvino",
    userId: "4e386ff4-924f-477d-9126-f55bbe0cde81",
  },
  // ... altri tag (ne metto solo alcuni per ora, poi aggiungerò tutti)
];

async function createFinalCSV() {
  console.log("🔄 Creando CSV finale con ID reali...");

  // 1. Leggi i dati originali dal JSON
  const jsonPath = path.join(__dirname, "sqlite-export.json");
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  // 2. Crea mapping dei tag
  const tagMapping = new Map();
  supabaseTags.forEach((tag) => {
    const key = `${tag.name}_${tag.userId}`;
    tagMapping.set(key, tag.id);
  });

  // Per ora creo un CSV di test con alcuni esempi che so funzionare
  const csvLines = ["A,B"]; // Header: A=TagID, B=TransactionID

  // Aggiungi alcune relazioni di esempio per testare
  // (Tag: conad -> Transaction: "Spesa CONAD")
  csvLines.push(
    "e3969aed-fa19-4481-8fda-1e177e45cd86,2508d43d-ac8d-4447-a311-63ef7bb2d36e"
  );
  // (Tag: fornopiastra -> Transaction: "Forno piastra")
  csvLines.push(
    "2b1ca351-4852-4c8f-9b14-20a1940e6a29,160e09a1-9e3c-471b-9a23-76abdf290afb"
  );
  // (Tag: caffè -> Transaction: "Caffè Cavour")
  csvLines.push(
    "633bf40b-8d54-4443-a95d-d55a5f3916ec,2c5ae6bc-b0e1-4b21-8b26-13392d076985"
  );

  // 3. Salva CSV
  const csvContent = csvLines.join("\n");
  const csvPath = path.join(
    __dirname,
    "csv-export",
    "10-transaction_tags_FINAL.csv"
  );
  fs.writeFileSync(csvPath, csvContent);

  console.log("✅ CSV finale creato: 10-transaction_tags_FINAL.csv");
  console.log(`📊 Contiene ${csvLines.length - 1} relazioni di test`);
  console.log("");
  console.log("🚀 PROSSIMO PASSO:");
  console.log("Importa il file: 10-transaction_tags_FINAL.csv");
  console.log("Se funziona, aggiungerò tutte le 263 relazioni!");
}

createFinalCSV();
