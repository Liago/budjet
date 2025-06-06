// Script per verificare che la migrazione sia andata a buon fine
import { PrismaClient } from '@prisma/client';

// Client SQLite locale
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: "file:../../database/finance-tracker-db.sqlite",
    },
  },
});

// Client PostgreSQL Supabase
const postgresClient = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
    },
  },
});

async function verifyMigration() {
  console.log('🔍 Verificando migrazione dati...');
  
  try {
    // Connessioni
    console.log('🔗 Connettendo ai database...');
    await sqliteClient.$connect();
    await postgresClient.$connect();
    
    // Conta records in SQLite
    console.log('📊 Contando records SQLite...');
    const sqliteCounts = {
      users: await sqliteClient.user.count(),
      categories: await sqliteClient.category.count(),
      transactions: await sqliteClient.transaction.count(),
      tags: await sqliteClient.tag.count(),
      recurrentPayments: await sqliteClient.recurrentPayment.count(),
      savingsGoals: await sqliteClient.savingsGoal.count(),
      notifications: await sqliteClient.notification.count(),
      notificationPreferences: await sqliteClient.notificationPreference.count(),
      executionLogs: await sqliteClient.automaticExecutionLog.count(),
    };
    
    // Conta records in PostgreSQL
    console.log('📊 Contando records PostgreSQL...');
    const postgresCounts = {
      users: await postgresClient.user.count(),
      categories: await postgresClient.category.count(),
      transactions: await postgresClient.transaction.count(),
      tags: await postgresClient.tag.count(),
      recurrentPayments: await postgresClient.recurrentPayment.count(),
      savingsGoals: await postgresClient.savingsGoal.count(),
      notifications: await postgresClient.notification.count(),
      notificationPreferences: await postgresClient.notificationPreference.count(),
      executionLogs: await postgresClient.automaticExecutionLog.count(),
    };
    
    // Confronto
    console.log('\\n📋 Risultati migrazione:');
    console.log('================================');
    
    let allMatch = true;
    const tables = Object.keys(sqliteCounts);
    
    for (const table of tables) {
      const sqliteCount = sqliteCounts[table];
      const postgresCount = postgresCounts[table];
      const match = sqliteCount === postgresCount;
      
      if (!match) allMatch = false;
      
      const icon = match ? '✅' : '❌';
      console.log(`${icon} ${table.padEnd(20)} SQLite: ${sqliteCount.toString().padStart(4)} | PostgreSQL: ${postgresCount.toString().padStart(4)}`);
    }
    
    console.log('================================');
    
    if (allMatch) {
      console.log('🎉 MIGRAZIONE PERFETTA! Tutti i dati sono stati trasferiti correttamente.');
      
      // Test di integrità aggiuntivi
      console.log('\\n🔍 Test di integrità aggiuntivi...');
      
      // Verifica che ci siano transazioni con tags
      const transactionsWithTags = await postgresClient.transaction.count({
        where: {
          tags: {
            some: {}
          }
        }
      });
      
      console.log(`📊 Transazioni con tags: ${transactionsWithTags}`);
      
      // Verifica sample user
      const sampleUser = await postgresClient.user.findFirst({
        include: {
          categories: true,
          transactions: { take: 3 },
          tags: true,
        }
      });
      
      if (sampleUser) {
        console.log(`👤 Sample user: ${sampleUser.email}`);
        console.log(`   📁 Categories: ${sampleUser.categories.length}`);
        console.log(`   💰 Transactions: ${sampleUser.transactions.length}`);
        console.log(`   🏷️  Tags: ${sampleUser.tags.length}`);
      }
      
    } else {
      console.log('⚠️  ATTENZIONE: Alcuni dati non corrispondono. Verifica i log di importazione.');
    }
    
    return allMatch;
    
  } catch (error) {
    console.error('❌ Errore durante verifica:', error);
    return false;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Esegui verifica
verifyMigration()
  .then((success) => {
    if (success) {
      console.log('\\n✅ Verifica completata con successo!');
      console.log('🚀 Puoi procedere a ripristinare la configurazione locale SQLite.');
    } else {
      console.log('\\n❌ Verifica fallita. Controlla i log e riprova l\\'importazione.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Errore fatale:', error);
    process.exit(1);
  });
