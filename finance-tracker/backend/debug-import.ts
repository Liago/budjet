// Script per debuggare l'import PostgreSQL
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function debugImport() {
  console.log('🔍 DEBUG IMPORT POSTGRESQL');
  console.log('==========================');
  console.log('');
  
  try {
    // Step 1: Verifica configurazione
    console.log('⚙️  Step 1: Verifica configurazione...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 40) + '...');
    
    // Step 2: Test connessione PostgreSQL
    console.log('');
    console.log('🔗 Step 2: Test connessione PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Connesso a PostgreSQL');
    
    // Verifica versione database
    const version = await prisma.$queryRaw`SELECT version()` as any[];
    if (version && version[0] && version[0].version) {
      const versionString = version[0].version as string;
      if (versionString.includes('PostgreSQL')) {
        console.log('✅ Database PostgreSQL confermato');
        console.log(`   Versione: ${versionString.split(' ')[1]}`);
      } else {
        console.log('❌ ERRORE: Non è PostgreSQL!');
        console.log(`   Versione rilevata: ${versionString}`);
      }
    }
    
    // Step 3: Verifica file export
    console.log('');
    console.log('📂 Step 3: Verifica file export...');
    const exportPath = path.join(__dirname, 'sqlite-export.json');
    
    if (!fs.existsSync(exportPath)) {
      console.log(`❌ File export non trovato: ${exportPath}`);
      return;
    }
    
    const stats = fs.statSync(exportPath);
    console.log(`✅ File export trovato: ${exportPath}`);
    console.log(`   📊 Dimensione: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   🕒 Ultima modifica: ${stats.mtime.toISOString()}`);
    
    // Step 4: Analizza contenuto export
    console.log('');
    console.log('📊 Step 4: Analisi contenuto export...');
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    console.log(`   👥 Users: ${data.users?.length || 0}`);
    console.log(`   📝 Execution Logs: ${data.automaticExecutionLogs?.length || 0}`);
    
    if (data.users && data.users.length > 0) {
      let totalCategories = 0, totalTransactions = 0, totalTags = 0;
      let totalRecurrentPayments = 0, totalSavingsGoals = 0, totalNotifications = 0;
      
      data.users.forEach(user => {
        totalCategories += user.categories?.length || 0;
        totalTransactions += user.transactions?.length || 0;
        totalTags += user.tags?.length || 0;
        totalRecurrentPayments += user.recurrentPayments?.length || 0;
        totalSavingsGoals += user.savingsGoals?.length || 0;
        totalNotifications += user.notifications?.length || 0;
      });
      
      console.log(`   📁 Categories: ${totalCategories}`);
      console.log(`   💰 Transactions: ${totalTransactions}`);
      console.log(`   🏷️  Tags: ${totalTags}`);
      console.log(`   🔄 Recurrent Payments: ${totalRecurrentPayments}`);
      console.log(`   💳 Savings Goals: ${totalSavingsGoals}`);
      console.log(`   🔔 Notifications: ${totalNotifications}`);
      
      // Mostra primo utente
      const firstUser = data.users[0];
      console.log(`   📧 Primo utente: ${firstUser.email}`);
      console.log(`   👤 Nome: ${firstUser.firstName} ${firstUser.lastName}`);
    }
    
    // Step 5: Stato attuale database PostgreSQL
    console.log('');
    console.log('🗄️  Step 5: Stato attuale database PostgreSQL...');
    
    const currentUsers = await prisma.user.count();
    const currentCategories = await prisma.category.count();
    const currentTransactions = await prisma.transaction.count();
    const currentTags = await prisma.tag.count();
    
    console.log(`   👥 Users nel DB: ${currentUsers}`);
    console.log(`   📁 Categories nel DB: ${currentCategories}`);
    console.log(`   💰 Transactions nel DB: ${currentTransactions}`);
    console.log(`   🏷️  Tags nel DB: ${currentTags}`);
    
    if (currentUsers === 0) {
      console.log('');
      console.log('❌ DATABASE VUOTO!');
      console.log('   Il database PostgreSQL non contiene dati.');
      console.log('   L\'import probabilmente è fallito o non è mai stato eseguito.');
    } else {
      console.log('');
      console.log('✅ DATABASE CONTIENE DATI!');
      
      // Mostra dettagli primo utente nel DB
      const firstUser = await prisma.user.findFirst({
        include: {
          categories: { take: 3 },
          transactions: { take: 3 }
        }
      });
      
      if (firstUser) {
        console.log(`   📧 Primo utente nel DB: ${firstUser.email}`);
        console.log(`   👤 Nome: ${firstUser.firstName} ${firstUser.lastName}`);
      }
    }
    
    // Step 6: Test inserimento manuale
    console.log('');
    console.log('🧪 Step 6: Test inserimento manuale...');
    
    try {
      // Prova a inserire un utente di test
      const testUser = await prisma.user.create({
        data: {
          email: `test-${Date.now()}@debug.com`,
          password: 'test123',
          firstName: 'Test',
          lastName: 'Debug'
        }
      });
      
      console.log('✅ Inserimento manuale funziona!');
      console.log(`   🆔 Test user creato: ${testUser.id}`);
      
      // Rimuovi utente test
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log('✅ Test user rimosso');
      
    } catch (error) {
      console.log('❌ Inserimento manuale fallito!');
      console.log(`   Errore: ${error instanceof Error ? error.message : error}`);
    }
    
    // Step 7: Raccomandazioni
    console.log('');
    console.log('💡 RACCOMANDAZIONI:');
    
    if (currentUsers === 0) {
      console.log('');
      console.log('🔄 Il database è vuoto. Prova a:');
      console.log('   1. Eseguire nuovamente l\'import: npx ts-node import-postgresql-data.ts');
      console.log('   2. Controllare gli errori durante l\'import');
      console.log('   3. Verificare che i dati vengano effettivamente inseriti');
    } else {
      console.log('');
      console.log('✅ Il database contiene dati. Verifica su:');
      console.log('   https://app.supabase.com/project/cmwfwxrqbpjamqzuhpxy/editor');
    }
    
  } catch (error) {
    console.error('❌ Errore durante debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui debug
debugImport()
  .then(() => {
    console.log('');
    console.log('🏁 Debug completato!');
  })
  .catch((error) => {
    console.error('💥 Errore fatale durante debug:', error);
    process.exit(1);
  });