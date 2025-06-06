// Script per testare la configurazione prima della migrazione
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function testSetup() {
  console.log('🧪 VERIFICA CONFIGURAZIONE MIGRAZIONE');
  console.log('=====================================');
  console.log('');

  let allChecksPass = true;

  // Test 1: Verifica file SQLite
  console.log('📁 Test 1: Verifica database SQLite...');
  const sqliteDbPath = '../../database/finance-tracker-db.sqlite';
  if (fs.existsSync(sqliteDbPath)) {
    const stats = fs.statSync(sqliteDbPath);
    console.log(`✅ Database SQLite trovato: ${sqliteDbPath}`);
    console.log(`   📊 Dimensione: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   🕒 Ultima modifica: ${stats.mtime.toISOString()}`);
  } else {
    console.log(`❌ Database SQLite NON trovato: ${sqliteDbPath}`);
    allChecksPass = false;
  }

  // Test 2: Verifica schema.prisma
  console.log('');
  console.log('📄 Test 2: Verifica schema.prisma...');
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  if (fs.existsSync(schemaPath)) {
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const providerMatch = schemaContent.match(/provider\s*=\s*"([^"]+)"/);
    if (providerMatch) {
      const provider = providerMatch[1];
      console.log(`✅ Schema trovato, provider: ${provider}`);
      if (provider === 'sqlite') {
        console.log('✅ Schema configurato per SQLite (corretto per la migrazione)');
      } else if (provider === 'postgresql') {
        console.log('⚠️  Schema configurato per PostgreSQL');
        console.log('   💡 Sarà modificato automaticamente durante la migrazione');
      }
    } else {
      console.log('❌ Provider non trovato nel schema');
      allChecksPass = false;
    }
  } else {
    console.log('❌ Schema.prisma non trovato');
    allChecksPass = false;
  }

  // Test 3: Verifica backup schema SQLite
  console.log('');
  console.log('💾 Test 3: Verifica backup schema SQLite...');
  const backupPath = path.join(__dirname, 'prisma', 'schema.sqlite.backup');
  if (fs.existsSync(backupPath)) {
    console.log('✅ Backup schema SQLite trovato');
  } else {
    console.log('⚠️  Backup schema SQLite non trovato');
    console.log('   💡 Sarà creato automaticamente se necessario');
  }

  // Test 4: Test connessione database
  console.log('');
  console.log('🔌 Test 4: Test connessione database...');
  try {
    await prisma.$connect();
    console.log('✅ Connessione al database stabilita');
    
    // Prova a contare gli utenti
    const userCount = await prisma.user.count();
    console.log(`   👥 Utenti nel database: ${userCount}`);
    
    if (userCount > 0) {
      console.log('✅ Database contiene dati da migrare');
    } else {
      console.log('⚠️  Database vuoto - nessun dato da migrare');
    }
    
  } catch (error) {
    console.log('❌ Errore connessione database:', error instanceof Error ? error.message : error);
    allChecksPass = false;
  } finally {
    await prisma.$disconnect();
  }

  // Test 5: Verifica variabili ambiente
  console.log('');
  console.log('🔧 Test 5: Verifica variabili ambiente...');
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    console.log('✅ DATABASE_URL configurata');
    if (databaseUrl.includes('sqlite')) {
      console.log('✅ DATABASE_URL configurata per SQLite');
    } else if (databaseUrl.includes('postgresql')) {
      console.log('⚠️  DATABASE_URL configurata per PostgreSQL');
      console.log('   💡 Assicurati che sia corretto per il tuo ambiente attuale');
    }
  } else {
    console.log('❌ DATABASE_URL non configurata');
    allChecksPass = false;
  }

  // Test 6: Verifica file di script necessari
  console.log('');
  console.log('📜 Test 6: Verifica script necessari...');
  const requiredFiles = [
    'export-sqlite-data.ts',
    'import-postgresql-data.ts',
    'verify-migration.ts',
    'restore-local-config.sh'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} trovato`);
    } else {
      console.log(`❌ ${file} NON trovato`);
      allChecksPass = false;
    }
  }

  // Risultato finale
  console.log('');
  console.log('🏁 RISULTATO VERIFICA');
  console.log('====================');
  if (allChecksPass) {
    console.log('✅ Tutti i controlli superati!');
    console.log('🚀 Puoi procedere con la migrazione eseguendo: ./migrate-data.sh');
  } else {
    console.log('❌ Alcuni controlli falliti');
    console.log('🔧 Risolvi i problemi sopra elencati prima di procedere');
  }

  console.log('');
  console.log('💡 SUGGERIMENTI:');
  console.log('  - Assicurati che il database SQLite contenga i dati da migrare');
  console.log('  - Verifica la connessione internet per Supabase');
  console.log('  - Fai un backup dei dati prima della migrazione');
  console.log('  - Testa la migrazione prima su un ambiente di staging');

  return allChecksPass;
}

// Esegui test
testSetup()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Errore durante test setup:', error);
    process.exit(1);
  });