#!/usr/bin/env node

/**
 * 🔧 CREA UTENTE ANDREA - PRODUZIONE
 * Script per creare l'utente Andrea con credenziali specifiche
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAndreaUser() {
  console.log('🔧 CREAZIONE UTENTE ANDREA');
  console.log('==========================');
  
  // Verifica variabili d'ambiente
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL non configurata');
    console.log('📋 Configura su Netlify Dashboard:');
    console.log('   Site settings → Environment variables → Add variable');
    console.log('   Key: DATABASE_URL');
    console.log('   Value: postgresql://your-connection-string');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL configurata');
  console.log('🔗 Connessione al database...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test connessione database
    await prisma.$connect();
    console.log('✅ Connessione database OK');
    
    // Controlla se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email: 'andrea.zampierolo@me.com' }
    });
    
    if (existingUser) {
      console.log('👤 Utente Andrea già esistente');
      console.log('🔧 Aggiorno la password...');
      
      // Aggiorna password
      const hashedPassword = await bcrypt.hash('MandingO', 12);
      await prisma.user.update({
        where: { email: 'andrea.zampierolo@me.com' },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password aggiornata per andrea.zampierolo@me.com');
    } else {
      console.log('➕ Creazione nuovo utente Andrea...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('MandingO', 12);
      
      // Crea utente
      const user = await prisma.user.create({
        data: {
          email: 'andrea.zampierolo@me.com',
          password: hashedPassword,
          firstName: 'Andrea',
          lastName: 'Zampierolo'
        }
      });
      
      console.log('✅ Utente Andrea creato con successo!');
      console.log('📧 Email:', user.email);
      console.log('🆔 ID:', user.id);
    }
    
    console.log('');
    console.log('🎉 OPERAZIONE COMPLETATA!');
    console.log('');
    console.log('📋 Credenziali per il login:');
    console.log('   Email: andrea.zampierolo@me.com');
    console.log('   Password: MandingO');
    console.log('');
    console.log('🔍 Test login:');
    console.log('curl -X POST https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Origin: https://bud-jet.netlify.app" \\');
    console.log('  -d \'{"email":"andrea.zampierolo@me.com","password":"MandingO"}\'');
    
  } catch (error) {
    console.log('❌ ERRORE:', error.message);
    console.log('💥 Stack:', error.stack);
    
    if (error.code === 'P1001') {
      console.log('');
      console.log('🔧 POSSIBILI SOLUZIONI:');
      console.log('1. Verifica che DATABASE_URL sia configurata correttamente su Netlify');
      console.log('2. Verifica che il database PostgreSQL sia accessibile');
      console.log('3. Controlla che le migration siano state eseguite');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  createAndreaUser().catch(console.error);
}

module.exports = { createAndreaUser }; 