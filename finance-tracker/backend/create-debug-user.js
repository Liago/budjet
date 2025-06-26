#!/usr/bin/env node

/**
 * 🔧 CREA UTENTE DEBUG PER TEST
 * Questo script crea l'utente debug@test.com nel database di produzione
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Carica le variabili d'ambiente di produzione
require('dotenv').config({ path: '.env.production' });

console.log('🔧 CREAZIONE UTENTE DEBUG');
console.log('=========================');

async function createDebugUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔗 Connettendo al database...');
    await prisma.$connect();
    console.log('✅ Connessione stabilita');
    
    const debugUser = {
      email: 'debug@test.com',
      password: 'YourPassword123!',
      firstName: 'Debug',
      lastName: 'Test'
    };
    
    console.log(`\n👤 Creando utente: ${debugUser.email}`);
    
    // 1. Verifica se esiste già
    console.log('🔍 Verificando se l\'utente esiste...');
    const existingUser = await prisma.user.findUnique({
      where: { email: debugUser.email }
    });
    
    if (existingUser) {
      console.log('⚠️ Utente già esistente! Aggiornando password...');
      
      // Aggiorna la password
      const hashedPassword = await bcrypt.hash(debugUser.password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password aggiornata!');
    } else {
      console.log('➕ Creando nuovo utente...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash(debugUser.password, 10);
      
      // Crea utente
      const newUser = await prisma.user.create({
        data: {
          email: debugUser.email,
          password: hashedPassword,
          firstName: debugUser.firstName,
          lastName: debugUser.lastName
        }
      });
      
      console.log('✅ Utente creato con successo!');
      console.log(`📋 ID: ${newUser.id}`);
      
      // Crea categorie di default
      console.log('📁 Creando categorie di default...');
      const defaultCategories = [
        { name: "Food", icon: "restaurant", color: "#FF5733", isDefault: true },
        { name: "Transportation", icon: "directions_car", color: "#33FF57", isDefault: true },
        { name: "Housing", icon: "home", color: "#3357FF", isDefault: true },
        { name: "Entertainment", icon: "movie", color: "#FF33F5", isDefault: true },
        { name: "Shopping", icon: "shopping_cart", color: "#F5FF33", isDefault: true }
      ];
      
      await prisma.category.createMany({
        data: defaultCategories.map(category => ({
          ...category,
          userId: newUser.id
        }))
      });
      
      console.log('✅ Categorie create!');
    }
    
    // 3. Test finale di verifica
    console.log('\n🧪 VERIFICA FINALE...');
    const finalUser = await prisma.user.findUnique({
      where: { email: debugUser.email }
    });
    
    if (finalUser) {
      const passwordTest = await bcrypt.compare(debugUser.password, finalUser.password);
      console.log(`✅ Utente trovato: ${finalUser.email}`);
      console.log(`✅ Password corretta: ${passwordTest ? 'SÌ' : 'NO'}`);
      
      if (passwordTest) {
        console.log('\n🎉 SUCCESSO! Ora puoi testare con:');
        console.log(`   📧 Email: ${debugUser.email}`);
        console.log(`   🔐 Password: ${debugUser.password}`);
        console.log('\n🚀 Esegui di nuovo il test:');
        console.log('   node complete-auth-test.js');
      }
    }
    
  } catch (error) {
    console.error('❌ ERRORE:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnesso dal database');
  }
}

// Esegui
createDebugUser().catch(error => {
  console.error('💥 ERRORE FATALE:', error);
  process.exit(1);
});
