// Test rapido della connessione SQLite
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🧪 Test connessione SQLite...');
  console.log('💾 DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    await prisma.$connect();
    console.log('✅ Connessione SQLite stabilita!');
    
    // Test semplice query
    const userCount = await prisma.user.count();
    console.log(`👥 Utenti nel database: ${userCount}`);
    
    if (userCount > 0) {
      // Mostra primo utente per verifica
      const firstUser = await prisma.user.findFirst({
        include: {
          transactions: { take: 3 },
          categories: { take: 3 }
        }
      });
      
      console.log('🎯 Primo utente trovato:');
      console.log(`   📧 Email: ${firstUser?.email}`);
      console.log(`   👤 Nome: ${firstUser?.firstName} ${firstUser?.lastName}`);
      console.log(`   💰 Transazioni: ${firstUser?.transactions.length}`);
      console.log(`   📁 Categorie: ${firstUser?.categories.length}`);
    }
    
    console.log('🎉 Database SQLite funziona correttamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Errore connessione SQLite:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then((success) => {
    if (success) {
      console.log('');
      console.log('✅ Tutto pronto per la migrazione!');
      console.log('🚀 Puoi ora eseguire: ./migrate-data.sh');
    } else {
      console.log('');
      console.log('❌ Risolvi i problemi di connessione prima di procedere');
    }
    process.exit(success ? 0 : 1);
  });