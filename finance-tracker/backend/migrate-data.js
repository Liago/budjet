// extract-sqlite-data.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const dotenv = require('dotenv');

// Load development environment
process.env.NODE_ENV = 'development';
const envFile = '.env.development';

if (fs.existsSync(path.join(__dirname, envFile))) {
  console.log(`Loading environment from ${envFile}`);
  dotenv.config({ path: path.join(__dirname, envFile) });
} else {
  console.log('Using default .env file');
  dotenv.config();
}

async function extractData() {
  console.log('🚀 Inizializzazione estrazione dati da SQLite...');
  
  // Percorso del database SQLite
  const dbPath = '/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite';
  
  try {
    // Connessione al database SQLite
    const db = new Database(dbPath, { readonly: true });
    console.log('✅ Connessione al database SQLite stabilita');
    
    // Ottieni l'elenco delle tabelle
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(`📋 Tabelle trovate: ${tables.map(t => t.name).join(', ')}`);
    
    // Estrai i dati da ogni tabella
    const data = {};
    for (const table of tables) {
      const tableName = table.name;
      if (tableName === 'sqlite_sequence') continue; // Salta tabelle di sistema
      
      console.log(`🔍 Lettura tabella: ${tableName}`);
      const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
      data[tableName] = rows;
      console.log(`  ↳ ${rows.length} righe estratte`);
    }
    
    // Salva i dati in un file JSON
    const outputPath = path.join(__dirname, 'sqlite-data.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(data, null, 2)
    );
    console.log(`✅ Dati estratti e salvati in ${outputPath}`);
    
    // Chiudi la connessione
    db.close();
    
    // Crea lo script di importazione
    createImportScript();
    
    return data;
  } catch (error) {
    console.error('❌ Errore durante l\'estrazione dei dati:', error);
    throw error;
  }
}

function createImportScript() {
  console.log('📝 Creazione dello script di importazione...');
  
  const importScript = `// import-pg-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function importData() {
  console.log('🚀 Inizializzazione importazione dati in PostgreSQL...');
  
  try {
    // Carica i dati dal file JSON
    const dataPath = path.join(__dirname, 'sqlite-data.json');
    if (!fs.existsSync(dataPath)) {
      console.error('❌ File sqlite-data.json non trovato!');
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('✅ Dati caricati da sqlite-data.json');
    
    // Verifica che il file .env contenga l'URL PostgreSQL
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('postgresql://')) {
      console.error('❌ Il DATABASE_URL nel file .env deve puntare a PostgreSQL');
      console.error('Aggiorna il file .env con l\\'URL PostgreSQL di Heroku');
      process.exit(1);
    }
    
    // Connessione al database PostgreSQL
    const prisma = new PrismaClient();
    console.log('✅ Connessione al database PostgreSQL stabilita');
    
    // Ordine di importazione per rispettare le dipendenze
    const importOrder = [
      'User',
      'Category', 
      'Tag',
      'AutomaticExecutionLog',
      'Transaction',
      'RecurrentPayment',
      'SavingsGoal', 
      'Notification',
      'NotificationPreference'
    ];
    
    // Mappa le relazioni tra tabelle SQLite e modelli Prisma
    const tableMap = {
      'User': 'user',
      'Category': 'category',
      'Tag': 'tag',
      'Transaction': 'transaction',
      'RecurrentPayment': 'recurrentPayment',
      'SavingsGoal': 'savingsGoal',
      'Notification': 'notification',
      'NotificationPreference': 'notificationPreference',
      'AutomaticExecutionLog': 'automaticExecutionLog'
    };
    
    // Relazioni molti-a-molti
    const manyToManyRelations = {
      'Transaction': {
        'tags': {
          throughTable: '_TagToTransaction',
          localField: 'A',
          foreignField: 'B'
        }
      }
    };
    
    // Importa i dati nell'ordine corretto
    for (const table of importOrder) {
      if (!data[table] || !tableMap[table]) {
        console.log(\`⚠️ Tabella \${table} non trovata nei dati o nella mappatura\`);
        continue;
      }
      
      console.log(\`📥 Importazione \${table}...\`);
      const prismaModel = tableMap[table];
      
      for (const item of data[table]) {
        // Rimuovi campi relazionali che verranno gestiti separatamente
        const itemCopy = {...item};
        
        // Gestisci campi speciali come date e decimali
        Object.keys(itemCopy).forEach(key => {
          // Converti stringhe di date in oggetti Date
          if (typeof itemCopy[key] === 'string' && 
              (key.includes('Date') || key === 'createdAt' || key === 'updatedAt')) {
            itemCopy[key] = new Date(itemCopy[key]);
          }
        });
        
        try {
          await prisma[prismaModel].upsert({
            where: { id: item.id },
            update: itemCopy,
            create: itemCopy
          });
        } catch (error) {
          console.error(\`❌ Errore importando \${table} con id \${item.id}:\`, error);
        }
      }
      
      console.log(\`✅ \${data[table].length} righe importate in \${table}\`);
    }
    
    // Gestisci relazioni molti-a-molti
    for (const [table, relations] of Object.entries(manyToManyRelations)) {
      if (!data[relations.throughTable]) {
        console.log(\`⚠️ Tabella di relazione \${relations.throughTable} non trovata\`);
        continue;
      }
      
      console.log(\`🔄 Importazione relazioni per \${table}...\`);
      
      for (const relation of data[relations.throughTable]) {
        try {
          // Per esempio, collegare tag alle transazioni
          if (table === 'Transaction' && relations.tags) {
            await prisma.transaction.update({
              where: { id: relation[relations.tags.localField] },
              data: {
                tags: {
                  connect: { id: relation[relations.tags.foreignField] }
                }
              }
            });
          }
        } catch (error) {
          console.error(\`❌ Errore importando relazione:\`, error);
        }
      }
    }
    
    console.log('🎉 Importazione completata con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\\'importazione:', error);
  } finally {
    // Chiudi la connessione
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  }
}

importData()
  .catch(e => {
    console.error('❌ Errore critico:', e);
    process.exit(1);
  });
`;
  
  fs.writeFileSync(
    path.join(__dirname, 'import-pg-data.js'),
    importScript
  );
  
  console.log(`✅ Script di importazione creato: import-pg-data.js`);
  console.log(`📋 Istruzioni per l'importazione dei dati:`);
  console.log(`1. Assicurati di avere risolto il problema delle migrazioni creando nuove migrazioni PostgreSQL`);
  console.log(`2. Aggiorna il file .env con l'URL PostgreSQL di Heroku:`);
  console.log(`   heroku config:get DATABASE_URL --app budjet-backend`);
  console.log(`3. Esegui lo script di importazione:`);
  console.log(`   npm install better-sqlite3`);
  console.log(`   node import-pg-data.js`);
}

// Installa la dipendenza better-sqlite3 se non è già presente
try {
  require('better-sqlite3');
} catch (error) {
  console.log('📦 Installazione di better-sqlite3...');
  require('child_process').execSync('npm install better-sqlite3', { stdio: 'inherit' });
}

extractData()
  .catch(e => {
    console.error('❌ Errore critico:', e);
    process.exit(1);
  });