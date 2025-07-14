// Script per verificare la struttura della tabella _TagToTransaction
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    },
  },
});

async function checkTableStructure() {
  console.log("🔍 Verificando struttura tabella _TagToTransaction...");

  try {
    await prisma.$connect();

    // Query per ottenere la struttura della tabella
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = '_TagToTransaction'
      ORDER BY ordinal_position;
    `;

    console.log("📊 STRUTTURA TABELLA _TagToTransaction:");
    console.log(columns);

    // Verifica anche le constraint per vedere i nomi delle foreign key
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_name = '_TagToTransaction';
    `;

    console.log("");
    console.log("🔗 CONSTRAINTS E FOREIGN KEYS:");
    console.log(constraints);

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Errore:", error);
    await prisma.$disconnect();
  }
}

checkTableStructure();
