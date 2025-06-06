// Script di debug semplificato per PostgreSQL
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleDebug() {
  console.log('🧪 DEBUG SEMPLIFICATO POSTGRESQL');
  console.log('=================================');
  console.log('');
  
  try {
    // Step 1: Configurazione
    console.log('⚙️  DATABASE_URL configurato:', process.env.DATABASE_URL ? 'SÌ' : 'NO');
    console.log('');
    
    // Step 2: Connessione con timeout
    console.log('🔗 Tentativo connessione PostgreSQL...');
    
    const connectionPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout connessione')), 10000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Connessione stabilita!');
    
    // Step 3: Test query semplice con timeout
    console.log('');
    console.log('🧪 Test query semplice...');
    
    const queryPromise = prisma.$queryRaw`SELECT 1 as test`;
    const queryTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout query')), 5000)
    );
    
    const result = await Promise.race([queryPromise, queryTimeoutPromise]) as any[];
    console.log('✅ Query funziona! Risultato:', result[0]);
    
    // Step 4: Conta users (veloce)
    console.log('');
    console.log('👥 Conteggio users...');
    const userCount = await prisma.user.count();
    console.log(`✅ Users nel database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('');
      console.log('❌ DATABASE VUOTO!');
      console.log('');
      console.log('🔄 SOLUZIONE:');
      console.log('1. Il database Supabase è vuoto');
      console.log('2. L\'import non ha funzionato');
      console.log('3. Esegui: npx ts-node import-postgresql-data.ts');
      console.log('');
    } else {
      console.log('');
      console.log('✅ DATABASE CONTIENE DATI!');
      console.log('');
      console.log('🎯 VERIFICA SU SUPABASE:');
      console.log('https://app.supabase.com/project/cmwfwxrqbpjamqzuhpxy/editor');
      console.log('');
      
      // Mostra primo utente
      try {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          console.log(`📧 Primo utente: ${firstUser.email}`);
          console.log(`👤 Nome: ${firstUser.firstName} ${firstUser.lastName}`);
        }
      } catch (error) {
        console.log('⚠️  Errore recupero dettagli utente:', error instanceof Error ? error.message : error);
      }
    }
    
  } catch (error) {
    console.error('❌ ERRORE:', error instanceof Error ? error.message : error);
    
    if (error instanceof Error) {
      if (error.message.includes('Timeout')) {
        console.log('');
        console.log('💡 PROBLEMA: Timeout connessione/query');
        console.log('🔧 SOLUZIONI:');
        console.log('   1. Problemi di rete con Supabase');
        console.log('   2. Database Supabase sovraccarico');
        console.log('   3. Credenziali errate');
        console.log('   4. Riprova tra qualche minuto');
      } else if (error.message.includes('authentication')) {
        console.log('');
        console.log('💡 PROBLEMA: Autenticazione');
        console.log('🔧 SOLUZIONE: Verifica DATABASE_URL in .env');
      } else if (error.message.includes('connect')) {
        console.log('');
        console.log('💡 PROBLEMA: Connessione');
        console.log('🔧 SOLUZIONI:');
        console.log('   1. Verifica connessione internet');
        console.log('   2. Verifica DATABASE_URL corretto');
        console.log('   3. Supabase potrebbe essere down');
      }
    }
  } finally {
    try {
      await prisma.$disconnect();
      console.log('');
      console.log('🔌 Disconnesso dal database');
    } catch (error) {
      // Ignora errori di disconnessione
    }
  }
}

// Esegui debug
simpleDebug()
  .then(() => {
    console.log('');
    console.log('🏁 Debug completato!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Errore fatale:', error);
    process.exit(1);
  });