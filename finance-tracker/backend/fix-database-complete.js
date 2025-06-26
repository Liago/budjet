#!/usr/bin/env node

/**
 * 🔧 FIX COMPLETO DATABASE + LOGIN ANDREA
 * Questo script risolve schema, rigenera client e fixa login
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 FIX COMPLETO DATABASE + LOGIN');
console.log('=================================');

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${description}...`);
    console.log(`💻 Eseguendo: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Errore: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`⚠️ Warning: ${stderr}`);
      }
      
      if (stdout) {
        console.log(`✅ Output: ${stdout}`);
      }
      
      console.log(`✅ ${description} completato`);
      resolve(stdout);
    });
  });
}

async function checkEnvironment() {
  console.log('\n📋 STEP 1: Verifica Environment');
  console.log('================================');
  
  // Verifica file .env.production
  const envPath = '.env.production';
  if (!fs.existsSync(envPath)) {
    console.error(`❌ File ${envPath} non trovato`);
    process.exit(1);
  }
  
  // Carica variabili ambiente
  require('dotenv').config({ path: envPath });
  
  console.log('✅ File .env.production trovato');
  console.log(`🔍 DATABASE_URL: ${process.env.DATABASE_URL ? 'PRESENTE' : 'MANCANTE'}`);
  console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL mancante in .env.production');
    process.exit(1);
  }
  
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.error('❌ DATABASE_URL non è PostgreSQL');
    process.exit(1);
  }
  
  console.log('✅ Environment verificato');
}

async function fixPrismaSchema() {
  console.log('\n🔧 STEP 2: Fix Prisma Schema');
  console.log('=============================');
  
  const schemaPath = 'prisma/schema.prisma';
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema Prisma non trovato: ${schemaPath}`);
    process.exit(1);
  }
  
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Verifica se è già PostgreSQL
  if (schemaContent.includes('provider = "postgresql"')) {
    console.log('✅ Schema già configurato per PostgreSQL');
  } else if (schemaContent.includes('provider = "sqlite"')) {
    console.log('🔄 Aggiornando schema da SQLite a PostgreSQL...');
    
    schemaContent = schemaContent.replace(
      'provider = "sqlite"',
      'provider = "postgresql"'
    );
    
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Schema aggiornato a PostgreSQL');
  } else {
    console.error('❌ Provider database non riconosciuto nel schema');
    process.exit(1);
  }
}

async function regeneratePrismaClient() {
  console.log('\n🔄 STEP 3: Rigenera Prisma Client');
  console.log('==================================');
  
  try {
    // Pulisci client esistente
    await runCommand('rm -rf node_modules/.prisma', 'Pulizia client Prisma esistente');
    
    // Rigenera client
    await runCommand('npx prisma generate', 'Rigenerazione client Prisma');
    
    console.log('✅ Client Prisma rigenerato');
  } catch (error) {
    console.error('❌ Errore rigenerazione client:', error.message);
    process.exit(1);
  }
}

async function testDatabaseConnection() {
  console.log('\n🔗 STEP 4: Test Connessione Database');
  console.log('=====================================');
  
  try {
    // Usa il client rigenerato
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔄 Testando connessione...');
    await prisma.$connect();
    console.log('✅ Connessione database stabilita');
    
    // Test query semplice
    const userCount = await prisma.user.count();
    console.log(`📊 Utenti nel database: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Test connessione completato');
    
  } catch (error) {
    console.error('❌ Errore connessione database:', {
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'P1001') {
      console.log('\n💡 SUGGERIMENTI:');
      console.log('1. Verifica che Supabase sia attivo');
      console.log('2. Controlla le credenziali DATABASE_URL');
      console.log('3. Verifica connessione internet');
    }
    
    process.exit(1);
  }
}

async function createAndreaUser() {
  console.log('\n👤 STEP 5: Crea/Aggiorna Utente Andrea');
  console.log('=======================================');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const bcrypt = require('bcryptjs');
    
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    const andreaData = {
      email: 'andrea.zampierolo@me.com',
      password: 'Mandingo',
      firstName: 'Andrea',
      lastName: 'Zampierolo'
    };
    
    console.log(`👤 Gestendo utente: ${andreaData.email}`);
    
    // Verifica se esiste
    const existingUser = await prisma.user.findUnique({
      where: { email: andreaData.email }
    });
    
    let userId;
    
    if (existingUser) {
      console.log('✅ Utente esistente trovato, aggiornando password...');
      
      const hashedPassword = await bcrypt.hash(andreaData.password, 10);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword }
      });
      
      userId = existingUser.id;
      console.log('✅ Password aggiornata');
    } else {
      console.log('➕ Creando nuovo utente...');
      
      const hashedPassword = await bcrypt.hash(andreaData.password, 10);
      const newUser = await prisma.user.create({
        data: {
          email: andreaData.email,
          password: hashedPassword,
          firstName: andreaData.firstName,
          lastName: andreaData.lastName
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
    
    // Verifica password finale
    const finalUser = await prisma.user.findUnique({
      where: { email: andreaData.email }
    });
    
    const passwordTest = await bcrypt.compare(andreaData.password, finalUser.password);
    console.log(`✅ Password match: ${passwordTest ? 'SÌ' : 'NO'}`);
    
    if (!passwordTest) {
      console.error('❌ Password non corrisponde - errore critico!');
      process.exit(1);
    }
    
    await prisma.$disconnect();
    console.log('✅ Operazioni database completate');
    
    return andreaData;
    
  } catch (error) {
    console.error('❌ Errore gestione utente:', {
      message: error.message,
      code: error.code
    });
    process.exit(1);
  }
}

async function testLoginAPI(credentials) {
  console.log('\n🌐 STEP 6: Test Login API');  
  console.log('==========================');
  
  return new Promise((resolve) => {
    const https = require('https');
    
    console.log('🧪 Testing login API...');
    
    const loginData = JSON.stringify({
      email: credentials.email,
      password: credentials.password
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
              console.log(`   📧 Email: ${credentials.email}`);
              console.log(`   🔐 Password: ${credentials.password}`);
              console.log('\n🚀 PRONTO PER IL FRONTEND!');
            }
          } catch (e) {
            console.log('⚠️ Login riuscito ma errore parsing JSON');
          }
        } else if (res.statusCode === 401) {
          console.log('❌ Login ancora fallito (401)');
          console.log('💡 Possibili cause:');
          console.log('   - Cache del backend non aggiornata');
          console.log('   - Serve un redeploy del backend');
          console.log('   - Problema di sincronizzazione database');
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

async function main() {
  try {
    console.log('🚀 Iniziando fix completo...\n');
    
    await checkEnvironment();
    await fixPrismaSchema();
    await regeneratePrismaClient();
    await testDatabaseConnection();
    const andreaCredentials = await createAndreaUser();
    await testLoginAPI(andreaCredentials);
    
    console.log('\n🎯 FIX COMPLETO TERMINATO!');
    console.log('===========================');
    console.log('✅ Schema Prisma: PostgreSQL');
    console.log('✅ Client Prisma: Rigenerato');
    console.log('✅ Database: Connesso');
    console.log('✅ Utente Andrea: Creato/Aggiornato');
    console.log('✅ API Test: Completato');
    console.log('\n🚀 Il login dovrebbe ora funzionare!');
    
  } catch (error) {
    console.error('\n💥 ERRORE FATALE:', error);
    process.exit(1);
  }
}

// Esegui il fix completo
main();
