#!/usr/bin/env node

/**
 * 🔧 FIX COMPLETO UTENTE ANDREA 
 * Questo script risolve il problema di login per andrea.zampierolo@me.com
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const https = require('https');

// Carica le variabili d'ambiente di produzione
require('dotenv').config({ path: '.env.production' });

console.log('👤 FIX COMPLETO LOGIN ANDREA');
console.log('=============================');

const ANDREA_CREDENTIALS = {
  email: 'andrea.zampierolo@me.com',
  password: 'Mandingo',
  firstName: 'Andrea',
  lastName: 'Zampierolo'
};

async function fixAndreaLogin() {
  const prisma = new PrismaClient();
  
  try {
    // STEP 1: Database Operations
    console.log('🔗 STEP 1: Connessione database...');
    await prisma.$connect();
    console.log('✅ Database connesso');
    
    console.log(`\n👤 STEP 2: Gestione utente ${ANDREA_CREDENTIALS.email}`);
    
    // Verifica se esiste
    const existingUser = await prisma.user.findUnique({
      where: { email: ANDREA_CREDENTIALS.email }
    });
    
    let userId;
    
    if (existingUser) {
      console.log('✅ Utente trovato, aggiornando password...');
      
      const hashedPassword = await bcrypt.hash(ANDREA_CREDENTIALS.password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      
      userId = existingUser.id;
      console.log('✅ Password aggiornata');
    } else {
      console.log('➕ Creando nuovo utente...');
      
      const hashedPassword = await bcrypt.hash(ANDREA_CREDENTIALS.password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: ANDREA_CREDENTIALS.email,
          password: hashedPassword,
          firstName: ANDREA_CREDENTIALS.firstName,
          lastName: ANDREA_CREDENTIALS.lastName
        }
      });
      
      userId = newUser.id;
      console.log(`✅ Utente creato con ID: ${userId}`);
      
      // Crea categorie di default per nuovo utente
      console.log('📁 Creando categorie di default...');
      const defaultCategories = [
        { name: "Food", icon: "restaurant", color: "#FF5733", isDefault: true },
        { name: "Transportation", icon: "directions_car", color: "#33FF57", isDefault: true },
        { name: "Housing", icon: "home", color: "#3357FF", isDefault: true },
        { name: "Entertainment", icon: "movie", color: "#FF33F5", isDefault: true },
        { name: "Shopping", icon: "shopping_cart", color: "#F5FF33", isDefault: true },
        { name: "Utilities", icon: "power", color: "#33FFF5", isDefault: true },
        { name: "Healthcare", icon: "local_hospital", color: "#FF3333", isDefault: true },
        { name: "Salary", icon: "attach_money", color: "#33FF33", isDefault: true },
        { name: "Investments", icon: "trending_up", color: "#3333FF", isDefault: true },
        { name: "Gifts", icon: "card_giftcard", color: "#FF33FF", isDefault: true }
      ];
      
      await prisma.category.createMany({
        data: defaultCategories.map(category => ({
          ...category,
          userId: userId
        }))
      });
      
      console.log('✅ Categorie create');
    }
    
    // STEP 3: Verifica password
    console.log('\n🔐 STEP 3: Verifica password...');
    const finalUser = await prisma.user.findUnique({
      where: { email: ANDREA_CREDENTIALS.email }
    });
    
    const passwordTest = await bcrypt.compare(ANDREA_CREDENTIALS.password, finalUser.password);
    console.log(`✅ Password match: ${passwordTest ? 'SÌ' : 'NO'}`);
    
    if (!passwordTest) {
      console.log('❌ Password non corrisponde - errore critico!');
      return;
    }
    
    await prisma.$disconnect();
    console.log('✅ Database operations completate');
    
    // STEP 4: Test API Live
    console.log('\n🌐 STEP 4: Test API in produzione...');
    
    await testLogin();
    
  } catch (error) {
    console.error('❌ ERRORE DATABASE:', {
      message: error.message,
      code: error.code
    });
  }
}

function testLogin() {
  return new Promise((resolve) => {
    console.log('🧪 Testing login con credenziali Andrea...');
    
    const loginData = JSON.stringify({
      email: ANDREA_CREDENTIALS.email,
      password: ANDREA_CREDENTIALS.password
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData),
        'Origin': 'https://bud-jet.netlify.app'
      }
    };
    
    console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login');
    
    const req = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login', options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📡 Login Status: ${res.statusCode}`);
        console.log(`📡 Response: ${data}`);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const json = JSON.parse(data);
            if (json.accessToken || (json.data && json.data.accessToken)) {
              console.log('\n🎉🎉🎉 LOGIN ANDREA RIUSCITO! 🎉🎉🎉');
              console.log('✅ Il backend funziona perfettamente');
              console.log('✅ JWT generato correttamente');
              console.log('✅ Database integrato');
              console.log('\n📋 CREDENZIALI FUNZIONANTI:');
              console.log(`   📧 Email: ${ANDREA_CREDENTIALS.email}`);
              console.log(`   🔐 Password: ${ANDREA_CREDENTIALS.password}`);
              console.log('\n🚀 PRONTO PER IL FRONTEND!');
            }
          } catch (e) {
            console.log('⚠️ Login riuscito ma errore parsing JSON');
          }
        } else if (res.statusCode === 401) {
          console.log('❌ Login ancora fallito (401)');
          console.log('🔍 Possibili cause:');
          console.log('   - Cache del database non aggiornata');
          console.log('   - Problema di sincronizzazione');
          console.log('   - Errore nel backend code');
          console.log('\n💡 PROVA:');
          console.log('1. Attendi 30 secondi e riprova');
          console.log('2. Controlla i log di Netlify Functions');
          console.log('3. Forza un redeploy del backend');
        } else {
          console.log(`❌ Status inaspettato: ${res.statusCode}`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      resolve();
    });
    
    req.write(loginData);
    req.end();
  });
}

// Esegui il fix completo
fixAndreaLogin().catch(error => {
  console.error('💥 ERRORE FATALE:', error);
  process.exit(1);
});
