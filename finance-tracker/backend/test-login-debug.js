#!/usr/bin/env node

/**
 * 🔧 DEBUG LOGIN TEST
 * Testa il processo di login per capire dove fallisce
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function debugLoginTest() {
  console.log('🔧 DEBUG LOGIN TEST');
  console.log('===================');
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connesso');
    
    // 1. Verifica che l'utente esista
    const user = await prisma.user.findUnique({
      where: { email: 'andrea.zampierolo@me.com' }
    });
    
    if (!user) {
      console.log('❌ Utente non trovato nel database');
      return;
    }
    
    console.log('✅ Utente trovato:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.password.substring(0, 20) + '...'
    });
    
    // 2. Testa la password
    const isPasswordValid = await bcrypt.compare('MandingO', user.password);
    console.log('🔑 Test password:', isPasswordValid ? '✅ VALIDA' : '❌ INVALIDA');
    
    if (!isPasswordValid) {
      console.log('🔧 Re-hashing password...');
      const newHash = await bcrypt.hash('MandingO', 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      });
      console.log('✅ Password re-hashed');
      
      // Test di nuovo
      const reTestValid = await bcrypt.compare('MandingO', newHash);
      console.log('🔑 Re-test password:', reTestValid ? '✅ VALIDA' : '❌ ANCORA INVALIDA');
    }
    
    // 3. Verifica JWT_SECRET
    console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET ? 
      `✅ CONFIGURATO (${process.env.JWT_SECRET.length} chars)` : 
      '❌ NON CONFIGURATO'
    );
    
    if (!process.env.JWT_SECRET) {
      console.log('');
      console.log('🚨 PROBLEMA IDENTIFICATO: JWT_SECRET mancante!');
      console.log('📋 SOLUZIONE:');
      console.log('1. Vai su Netlify Dashboard del backend');
      console.log('2. Site settings → Environment variables');
      console.log('3. Aggiungi: JWT_SECRET = your-secret-at-least-32-characters-long');
      console.log('4. Redeploy il sito');
    }
    
    console.log('');
    console.log('📋 STATO DEBUG:');
    console.log('- Database: ✅ Connesso');
    console.log('- Utente: ✅ Esistente');
    console.log('- Password: ' + (isPasswordValid ? '✅ Valida' : '❌ Invalida'));
    console.log('- JWT_SECRET: ' + (process.env.JWT_SECRET ? '✅ Configurato' : '❌ Mancante'));
    
  } catch (error) {
    console.log('❌ ERRORE DEBUG:', error.message);
    console.log('💥 Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui
debugLoginTest().catch(console.error);
