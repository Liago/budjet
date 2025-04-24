// import-pg-data.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load production environment
process.env.NODE_ENV = 'production';
const envFile = '.env.production';

if (fs.existsSync(path.join(__dirname, envFile))) {
  console.log(`Loading environment from ${envFile}`);
  dotenv.config({ path: path.join(__dirname, envFile) });
} else {
  console.log('Using default .env file');
  dotenv.config();
}

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
    
    // Verifica che DATABASE_URL punti a PostgreSQL
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('postgres')) {
      console.error('❌ DATABASE_URL non impostato o non punta a PostgreSQL');
      console.error('Assicurati di usare l\'ambiente di produzione');
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
        console.log(`⚠️ Tabella ${table} non trovata nei dati o nella mappatura`);
        continue;
      }
      
      console.log(`📥 Importazione ${table}...`);
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
          
          // Converti valori numerici di timestamp in date 
          if (typeof itemCopy[key] === 'number' && 
              (key.includes('Date') || key === 'createdAt' || key === 'updatedAt' || key === 'date')) {
            // Convert from milliseconds to JavaScript Date object
            itemCopy[key] = new Date(itemCopy[key]);
          }
          
          // Converti numeri interi 0/1 in booleani per PostgreSQL
          if (key === 'isActive' || key === 'isDefault' || key === 'isCompleted' || key === 'isRead' || key === 'enabled') {
            if (itemCopy[key] === 1 || itemCopy[key] === "1") {
              itemCopy[key] = true;
            } else if (itemCopy[key] === 0 || itemCopy[key] === "0") {
              itemCopy[key] = false;
            }
          }
        });
        
        try {
          await prisma[prismaModel].upsert({
            where: { id: item.id },
            update: itemCopy,
            create: itemCopy
          });
        } catch (error) {
          console.error(`❌ Errore importando ${table} con id ${item.id}:`, error.message);
          console.log('Continuo con il prossimo record...');
        }
      }
      
      console.log(`✅ ${data[table].length} righe importate in ${table}`);
    }
    
    // Gestisci relazioni molti-a-molti
    for (const [table, relations] of Object.entries(manyToManyRelations)) {
      if (!data[relations.throughTable]) {
        console.log(`⚠️ Tabella di relazione ${relations.throughTable} non trovata`);
        continue;
      }
      
      console.log(`🔄 Importazione relazioni per ${table}...`);
      
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
          console.error(`❌ Errore importando relazione:`, error);
        }
      }
    }
    
    console.log('🎉 Importazione completata con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\'importazione:', error);
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
