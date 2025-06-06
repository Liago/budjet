// Script per esportare dati da SQLite locale a JSON
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Inizializza Prisma client con configurazione dal .env
const prisma = new PrismaClient();

async function exportData() {
  console.log('🔍 Iniziando esportazione dati da SQLite...');
  
  try {
    // Verifica connessione al database
    await prisma.$connect();
    console.log('✅ Connessione al database SQLite stabilita');
    
    // Esporta tutti i dati
    console.log('📤 Esportando dati...');
    const data = {
      users: await prisma.user.findMany({
        include: {
          categories: true,
          tags: true,
          transactions: {
            include: {
              tags: true,
            }
          },
          recurrentPayments: true,
          savingsGoals: true,
          notifications: true,
          notificationPreferences: true,
        }
      }),
      automaticExecutionLogs: await prisma.automaticExecutionLog.findMany({
        include: {
          transactions: true,
        }
      }),
    };

    // Statistiche export
    console.log('📊 Dati esportati:');
    console.log(`   👥 Users: ${data.users.length}`);
    
    let totalCategories = 0;
    let totalTransactions = 0;
    let totalTags = 0;
    let totalRecurrentPayments = 0;
    let totalSavingsGoals = 0;
    let totalNotifications = 0;
    let totalNotificationPreferences = 0;
    
    data.users.forEach(user => {
      totalCategories += user.categories.length;
      totalTransactions += user.transactions.length;
      totalTags += user.tags.length;
      totalRecurrentPayments += user.recurrentPayments.length;
      totalSavingsGoals += user.savingsGoals.length;
      totalNotifications += user.notifications.length;
      totalNotificationPreferences += user.notificationPreferences.length;
    });
    
    console.log(`   📁 Categories: ${totalCategories}`);
    console.log(`   💰 Transactions: ${totalTransactions}`);
    console.log(`   🏷️  Tags: ${totalTags}`);
    console.log(`   🔄 Recurrent Payments: ${totalRecurrentPayments}`);
    console.log(`   💳 Savings Goals: ${totalSavingsGoals}`);
    console.log(`   🔔 Notifications: ${totalNotifications}`);
    console.log(`   ⚙️  Notification Preferences: ${totalNotificationPreferences}`);
    console.log(`   📝 Execution Logs: ${data.automaticExecutionLogs.length}`);

    // Verifica integrità dati
    if (data.users.length === 0) {
      console.log('⚠️  Nessun utente trovato nel database');
    } else {
      console.log('✅ Dati trovati e pronti per l\'export');
    }

    // Salva in file JSON
    const exportPath = path.join(__dirname, 'sqlite-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Dati esportati in: ${exportPath}`);
    console.log(`📦 Dimensione file: ${(fs.statSync(exportPath).size / 1024).toFixed(2)} KB`);
    
    return data;
    
  } catch (error) {
    console.error('❌ Errore durante esportazione:', error);
    
    // Informazioni aggiuntive per debug
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        console.error('💡 Il file del database SQLite potrebbe non esistere');
        console.error('🔍 Verifica che il percorso sia corretto: ../../database/finance-tracker-db.sqlite');
      } else if (error.message.includes('no such table')) {
        console.error('💡 Le tabelle potrebbero non esistere nel database');
        console.error('🔧 Prova ad eseguire: npx prisma db push');
      } else if (error.message.includes('provider')) {
        console.error('💡 Problema di configurazione del provider del database');
        console.error('🔧 Verifica che schema.prisma sia configurato per SQLite');
      }
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui export
exportData()
  .then(() => {
    console.log('🎉 Esportazione completata con successo!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Errore fatale:', error);
    process.exit(1);
  });