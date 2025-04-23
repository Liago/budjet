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
    
    // Verifica che il file .env contenga l'URL PostgreSQL
    if (!process.env.DATABASE_URL.includes('postgres')) {
      console.error('❌ Il DATABASE_URL deve puntare a PostgreSQL');
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
    
    // Verifica che le tabelle esistano nel database PostgreSQL
    console.log('🔍 Verifica delle tabelle nel database PostgreSQL...');
    try {
      // Eseguiamo una semplice query per verificare che tutto funzioni
      const userCount = await prisma.user.count();
      console.log(`✅ Tabella User verificata, contiene ${userCount} record`);
    } catch (error) {
      console.error('❌ Errore durante la verifica delle tabelle:', error.message);
      console.error('Assicurati che lo schema del database sia stato creato correttamente.');
      console.error('Prova a eseguire: node recreate-migrations.js');
      throw error;
    }
    
    // Tieni traccia dei record importati correttamente
    const successfulImports = {
      Transaction: [],
      Tag: []
    };
    
    // Importa i dati nell'ordine corretto
    for (const table of importOrder) {
      if (!data[table] || !tableMap[table]) {
        console.log(`⚠️ Tabella ${table} non trovata nei dati o nella mappatura`);
        continue;
      }
      
      console.log(`📥 Importazione ${table}...`);
      const prismaModel = tableMap[table];
      let successCount = 0;
      
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
          
          // Converti decimali da string a Decimal
          if (key === 'amount' || key === 'targetAmount' || key === 'currentAmount' || key === 'budget' || key === 'totalAmount') {
            if (typeof itemCopy[key] === 'string') {
              itemCopy[key] = parseFloat(itemCopy[key]);
            }
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
          const result = await prisma[prismaModel].upsert({
            where: { id: item.id },
            update: itemCopy,
            create: itemCopy
          });
          
          // Salva l'ID del record importato con successo
          if (table === 'Transaction' || table === 'Tag') {
            successfulImports[table].push(item.id);
          }
          
          successCount++;
        } catch (error) {
          console.error(`❌ Errore importando ${table} con id ${item.id}:`, error.message);
          console.log('Continuo con il prossimo record...');
        }
      }
      
      console.log(`✅ ${successCount} record importati con successo su ${data[table].length} in ${table}`);
    }
    
    // Gestisci relazioni molti-a-molti per tag e transazioni
    if (data['_TagToTransaction'] && data['_TagToTransaction'].length > 0 && 
        successfulImports.Transaction.length > 0 && successfulImports.Tag.length > 0) {
        
      console.log(`📥 Importazione relazioni tag-transaction...`);
      let relationCount = 0;
      
      // Converti array in Set per lookup veloce
      const validTransactionIds = new Set(successfulImports.Transaction);
      const validTagIds = new Set(successfulImports.Tag);
      
      // Filtra solo le relazioni valide
      const validRelations = data['_TagToTransaction'].filter(relation => 
        validTransactionIds.has(relation.A) && validTagIds.has(relation.B)
      );
      
      console.log(`🔍 Trovate ${validRelations.length} relazioni valide da importare`);
      
      // Importa una alla volta per evitare errori
      for (const relation of validRelations) {
        try {
          await prisma.transaction.update({
            where: { id: relation.A },
            data: {
              tags: {
                connect: [{ id: relation.B }]
              }
            }
          });
          relationCount++;
        } catch (error) {
          console.error(`❌ Errore collegando tag ${relation.B} alla transazione ${relation.A}:`, error.message);
        }
      }
      
      console.log(`✅ Importate ${relationCount} relazioni tag-transaction su ${validRelations.length}`);
    } else {
      console.log('⚠️ Non è stato possibile importare le relazioni tag-transaction: dati mancanti');
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
