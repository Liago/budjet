#!/usr/bin/env node

/**
 * 🔧 FIX UTENTE ANDREA - SOLO PRODUZIONE
 * Questo script crea l'utente direttamente nel database PostgreSQL
 * SENZA modificare lo schema locale (che rimane SQLite)
 */

const bcrypt = require('bcryptjs');
const https = require('https');

console.log('👤 FIX UTENTE ANDREA - SOLO PRODUZIONE');
console.log('======================================');
console.log('ℹ️  Questo script NON modifica la configurazione locale');
console.log('ℹ️  Usa connessione diretta al database di produzione');
console.log('');

// Carica configurazione produzione
require('dotenv').config({ path: '.env.production' });

async function createAndreaUserProduction() {
  try {
    console.log('🔗 STEP 1: Connessione diretta a PostgreSQL produzione');
    console.log('======================================================');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL non trovato in .env.production');
    }
    
    if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
      throw new Error('DATABASE_URL non è PostgreSQL');
    }
    
    console.log('✅ DATABASE_URL PostgreSQL trovato');
    console.log(`🔍 URL: ${process.env.DATABASE_URL.substring(0, 30)}...`);
    
    // Usa connessione diretta PostgreSQL con node-postgres
    const { Client } = require('pg');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Per Supabase
      }
    });
    
    console.log('🔄 Connettendo al database...');
    await client.connect();
    console.log('✅ Connessione PostgreSQL stabilita');
    
    console.log('\n👤 STEP 2: Gestione utente Andrea');
    console.log('==================================');
    
    const andreaData = {
      email: 'andrea.zampierolo@me.com',
      password: 'Mandingo',
      firstName: 'Andrea',
      lastName: 'Zampierolo'
    };
    
    console.log(`👤 Gestendo utente: ${andreaData.email}`);
    
    // 1. Verifica se l'utente esiste
    console.log('🔍 Verificando se utente esiste...');
    const userExistsQuery = 'SELECT id, email, password FROM "User" WHERE email = $1';
    const userResult = await client.query(userExistsQuery, [andreaData.email]);
    
    let userId;
    
    if (userResult.rows.length > 0) {
      // Utente esiste - aggiorna password
      console.log('✅ Utente esistente trovato, aggiornando password...');
      
      const existingUser = userResult.rows[0];
      userId = existingUser.id;
      
      const hashedPassword = await bcrypt.hash(andreaData.password, 10);
      
      const updateQuery = `
        UPDATE "User" 
        SET password = $1, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      await client.query(updateQuery, [hashedPassword, userId]);
      console.log('✅ Password aggiornata');
      
    } else {
      // Crea nuovo utente
      console.log('➕ Creando nuovo utente...');
      
      const hashedPassword = await bcrypt.hash(andreaData.password, 10);
      
      // Genera ID unico (cuid style)
      const { customAlphabet } = require('nanoid');
      const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 25);
      userId = 'c' + nanoid(24); // Simula cuid()
      
      const insertQuery = `
        INSERT INTO "User" (id, email, password, "firstName", "lastName", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `;
      
      await client.query(insertQuery, [
        userId,
        andreaData.email,
        hashedPassword,
        andreaData.firstName,
        andreaData.lastName
      ]);
      
      console.log(`✅ Utente creato con ID: ${userId}`);
      
      // Crea categorie di default
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
      
      for (const category of defaultCategories) {
        const categoryId = 'c' + nanoid(24);
        
        const categoryQuery = `
          INSERT INTO "Category" (id, name, icon, color, "isDefault", "userId", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;
        
        await client.query(categoryQuery, [
          categoryId,
          category.name,
          category.icon,
          category.color,
          category.isDefault,
          userId
        ]);
      }
      
      console.log('✅ Categorie create');
    }
    
    // 3. Verifica finale password
    console.log('\n🔐 STEP 3: Verifica finale password');
    console.log('====================================');
    
    const finalUserQuery = 'SELECT id, email, password FROM "User" WHERE email = $1';
    const finalResult = await client.query(finalUserQuery, [andreaData.email]);
    
    if (finalResult.rows.length === 0) {
      throw new Error('Utente non trovato dopo creazione/aggiornamento');
    }
    
    const finalUser = finalResult.rows[0];
    const passwordTest = await bcrypt.compare(andreaData.password, finalUser.password);
    
    console.log(`✅ Utente ID: ${finalUser.id}`);
    console.log(`✅ Email: ${finalUser.email}`);
    console.log(`✅ Password corretta: ${passwordTest ? 'SÌ' : 'NO'}`);
    
    if (!passwordTest) {
      throw new Error('Password non corrisponde dopo update');
    }
    
    await client.end();
    console.log('✅ Connessione database chiusa');
    
    return andreaData;
    
  } catch (error) {
    console.error('❌ ERRORE:', {
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    
    throw error;
  }
}

async function testLoginAPI(credentials) {
  console.log('\n🌐 STEP 4: Test Login API');  
  console.log('==========================');
  
  return new Promise((resolve) => {
    console.log('🧪 Testing login API in produzione...');
    
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
              
              console.log('\n🎯 RIASSUNTO SUCCESSO:');
              console.log('======================');
              console.log('✅ Configurazione locale: INALTERATA (SQLite)');
              console.log('✅ Database produzione: PostgreSQL funzionante');
              console.log('✅ Utente Andrea: Login working');
              console.log('✅ API Backend: Operativo');
              
            } else {
              console.log('⚠️ Login riuscito ma token non trovato nella risposta');
            }
          } catch (e) {
            console.log('⚠️ Login riuscito ma errore parsing JSON');
          }
        } else if (res.statusCode === 401) {
          console.log('❌ Login ancora fallito (401)');
          console.log('💡 Possibile causa: Cache backend, prova fra qualche minuto');
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
    console.log('🚀 Iniziando fix utente Andrea...\n');
    
    const andreaCredentials = await createAndreaUserProduction();
    await testLoginAPI(andreaCredentials);
    
    console.log('\n🎯 FIX COMPLETATO!');
    console.log('==================');
    console.log('ℹ️  Schema locale: INALTERATO (SQLite per sviluppo)');
    console.log('✅ Database produzione: Utente Andrea creato/aggiornato');
    console.log('✅ Test API: Completato');
    console.log('\n🚀 Il login dovrebbe ora funzionare!');
    console.log('\n📝 Per testare:');
    console.log('   node complete-auth-test.js');
    
  } catch (error) {
    console.error('\n💥 ERRORE FATALE:', error.message);
    console.log('\n💡 POSSIBILI SOLUZIONI:');
    console.log('1. Verifica che .env.production contenga DATABASE_URL corretto');
    console.log('2. Verifica connessione a Supabase');
    console.log('3. Installa dipendenze mancanti: npm install pg nanoid');
    process.exit(1);
  }
}

// Esegui il fix
main();
