// Script per esportare CSV separati da SQLite per import Supabase
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// FORZA DATABASE_URL per SQLite
process.env.DATABASE_URL = 'file:/Users/andreazampierolo/Projects/Bud-Jet/database/finance-tracker-db.sqlite';

const prisma = new PrismaClient();

// Funzione per convertire array di oggetti in CSV
function arrayToCSV(data: any[], filename: string): void {
  if (data.length === 0) {
    console.log(`⚠️  ${filename}: Nessun dato da esportare`);
    return;
  }

  // Ottieni headers dalle chiavi del primo oggetto
  const headers = Object.keys(data[0]);
  
  // Crea contenuto CSV
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        let value = row[header];
        
        // Gestisci valori null/undefined
        if (value === null || value === undefined) {
          return '';
        }
        
        // Gestisci date
        if (value instanceof Date) {
          value = value.toISOString();
        }
        
        // Gestisci stringhe con virgole/virgolette
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""'); // Escape quotes
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value}"`;
          }
        }
        
        return value;
      }).join(',')
    )
  ].join('\n');

  // Salva file
  const csvPath = path.join(__dirname, 'csv-exports', filename);
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  
  console.log(`✅ ${filename}: ${data.length} record esportati`);
}

async function exportToCSV() {
  console.log('📊 EXPORT CSV DA SQLITE');
  console.log('======================');
  console.log('');

  try {
    // Crea directory per CSV
    const csvDir = path.join(__dirname, 'csv-exports');
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }

    console.log('🔗 Connessione a SQLite...');
    await prisma.$connect();
    console.log('✅ Connesso al database SQLite');
    console.log('');

    // 1. Export Users
    console.log('👥 Esportando Users...');
    const users = await prisma.user.findMany();
    arrayToCSV(users, 'users.csv');

    // 2. Export Categories  
    console.log('📁 Esportando Categories...');
    const categories = await prisma.category.findMany();
    arrayToCSV(categories, 'categories.csv');

    // 3. Export Tags
    console.log('🏷️  Esportando Tags...');
    const tags = await prisma.tag.findMany();
    arrayToCSV(tags, 'tags.csv');

    // 4. Export Transactions (senza tags many-to-many)
    console.log('💰 Esportando Transactions...');
    const transactions = await prisma.transaction.findMany();
    arrayToCSV(transactions, 'transactions.csv');

    // 5. Export Transaction Tags (relazione many-to-many)
    console.log('🔗 Esportando Transaction-Tags relations...');
    
    // Usa Prisma relations invece di SQL raw
    const transactionsWithTags = await prisma.transaction.findMany({
      include: {
        tags: {
          select: {
            id: true
          }
        }
      }
    });
    
    // Flatten le relazioni many-to-many
    const transactionTags: any[] = [];
    transactionsWithTags.forEach(transaction => {
      transaction.tags.forEach(tag => {
        transactionTags.push({
          transaction_id: transaction.id,
          tag_id: tag.id
        });
      });
    });
    
    arrayToCSV(transactionTags, 'transaction_tags.csv');

    // 6. Export Recurrent Payments
    console.log('🔄 Esportando Recurrent Payments...');
    const recurrentPayments = await prisma.recurrentPayment.findMany();
    arrayToCSV(recurrentPayments, 'recurrent_payments.csv');

    // 7. Export Savings Goals
    console.log('💳 Esportando Savings Goals...');
    const savingsGoals = await prisma.savingsGoal.findMany();
    arrayToCSV(savingsGoals, 'savings_goals.csv');

    // 8. Export Notifications
    console.log('🔔 Esportando Notifications...');
    const notifications = await prisma.notification.findMany();
    arrayToCSV(notifications, 'notifications.csv');

    // 9. Export Notification Preferences
    console.log('⚙️  Esportando Notification Preferences...');
    const notificationPreferences = await prisma.notificationPreference.findMany();
    arrayToCSV(notificationPreferences, 'notification_preferences.csv');

    // 10. Export Execution Logs
    console.log('📝 Esportando Execution Logs...');
    const executionLogs = await prisma.automaticExecutionLog.findMany();
    arrayToCSV(executionLogs, 'execution_logs.csv');

    // Statistiche finali
    console.log('');
    console.log('📊 EXPORT COMPLETATO!');
    console.log('====================');
    console.log(`✅ Users: ${users.length}`);
    console.log(`✅ Categories: ${categories.length}`);
    console.log(`✅ Tags: ${tags.length}`);
    console.log(`✅ Transactions: ${transactions.length}`);
    console.log(`✅ Transaction-Tags: ${transactionTags.length}`);
    console.log(`✅ Recurrent Payments: ${recurrentPayments.length}`);
    console.log(`✅ Savings Goals: ${savingsGoals.length}`);
    console.log(`✅ Notifications: ${notifications.length}`);
    console.log(`✅ Notification Preferences: ${notificationPreferences.length}`);
    console.log(`✅ Execution Logs: ${executionLogs.length}`);
    
    console.log('');
    console.log('📁 File CSV salvati in: ./csv-exports/');
    console.log('');
    console.log('🚀 PROSSIMI PASSI:');
    console.log('1. Vai su Supabase Dashboard → Table Editor');
    console.log('2. Per ogni tabella, clicca "Insert" → "Import from CSV"');
    console.log('3. Ordine consigliato:');
    console.log('   - users.csv');
    console.log('   - categories.csv');
    console.log('   - tags.csv');
    console.log('   - transactions.csv');
    console.log('   - transaction_tags.csv');
    console.log('   - recurrent_payments.csv');
    console.log('   - savings_goals.csv');
    console.log('   - notifications.csv');
    console.log('   - notification_preferences.csv');
    console.log('   - execution_logs.csv');
    
  } catch (error) {
    console.error('❌ Errore durante export CSV:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui export
exportToCSV()
  .then(() => {
    console.log('');
    console.log('🎉 Export CSV completato con successo!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Errore fatale:', error);
    process.exit(1);
  });