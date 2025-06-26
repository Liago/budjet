#!/usr/bin/env node

/**
 * 🔧 CREA UTENTE DEBUG PER TEST - PRODUZIONE ONLY
 * Crea l'utente debug@test.com nel database PostgreSQL di produzione
 */

const https = require('https');

// Carica configurazione produzione
require('dotenv').config({ path: '.env.production' });

console.log('🔧 CREAZIONE UTENTE DEBUG');
console.log('=========================');

async function createDebugUserProduction() {
  try {
    console.log('🔗 Connessione diretta a PostgreSQL produzione');
    
    const { Client } = require('pg');
    const bcrypt = require('bcryptjs');
    const { customAlphabet } = require('nanoid');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    console.log('✅ Connesso al database');
    
    const debugData = {
      email: 'debug@test.com',
      password: 'YourPassword123!',
      firstName: 'Debug',
      lastName: 'Test'
    };
    
    console.log(`👤 Creando utente: ${debugData.email}`);
    
    // Verifica se esiste
    const userExistsQuery = 'SELECT id FROM "User" WHERE email = $1';
    const userResult = await client.query(userExistsQuery, [debugData.email]);
    
    let userId;
    
    if (userResult.rows.length > 0) {
      console.log('⚠️ Utente già esistente, aggiornando password...');
      userId = userResult.rows[0].id;
      
      const hashedPassword = await bcrypt.hash(debugData.password, 10);
      await client.query(
        'UPDATE "User" SET password = $1 WHERE id = $2',
        [hashedPassword, userId]
      );
      
      console.log('✅ Password aggiornata');
    } else {
      console.log('➕ Creando nuovo utente...');
      
      const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 25);
      userId = 'c' + nanoid(24);
      
      const hashedPassword = await bcrypt.hash(debugData.password, 10);
      
      await client.query(`
        INSERT INTO "User" (id, email, password, "firstName", "lastName", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [userId, debugData.email, hashedPassword, debugData.firstName, debugData.lastName]);
      
      console.log(`✅ Utente debug creato con ID: ${userId}`);
    }
    
    // Verifica password
    const finalResult = await client.query('SELECT password FROM "User" WHERE email = $1', [debugData.email]);
    const passwordTest = await bcrypt.compare(debugData.password, finalResult.rows[0].password);
    
    console.log(`✅ Password verificata: ${passwordTest ? 'CORRETTA' : 'ERRATA'}`);
    
    await client.end();
    return debugData;
    
  } catch (error) {
    console.error('❌ ERRORE:', error.message);
    throw error;
  }
}

async function testDebugLogin(credentials) {
  console.log('\n🧪 Test login utente debug');
  
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: credentials.email,
      password: credentials.password
    });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    
    const req = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login', options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log(`📡 Response: ${data}`);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('🎉 LOGIN DEBUG RIUSCITO!');
        } else {
          console.log('❌ Login ancora fallito');
        }
        resolve();
      });
    });
    
    req.on('error', error => {
      console.error('❌ Request error:', error.message);
      resolve();
    });
    
    req.write(loginData);
    req.end();
  });
}

async function main() {
  try {
    const debugCredentials = await createDebugUserProduction();
    await testDebugLogin(debugCredentials);
    
    console.log('\n🎯 UTENTE DEBUG CREATO!');
    console.log('========================');
    console.log('✅ debug@test.com creato nel database');
    console.log('✅ Password: YourPassword123!');
    console.log('\n📝 Ora esegui:');
    console.log('   node complete-auth-test.js');
    
  } catch (error) {
    console.error('💥 ERRORE:', error.message);
    process.exit(1);
  }
}

main();
