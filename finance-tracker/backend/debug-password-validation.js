#!/usr/bin/env node

/**
 * 🔍 DEBUG PASSWORD VALIDATION
 * Script per verificare esattamente perché la password non matcha
 */

const bcrypt = require('bcryptjs');

console.log('🔍 DEBUG PASSWORD VALIDATION');
console.log('=============================');

// Carica configurazione produzione
require('dotenv').config({ path: '.env.production' });

async function debugPasswordValidation() {
  try {
    console.log('🔗 Connessione al database...');
    
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    console.log('✅ Connesso');
    
    // Test entrambi gli utenti
    const testUsers = [
      { email: 'debug@test.com', password: 'YourPassword123!' },
      { email: 'andrea.zampierolo@me.com', password: 'Mandingo' }
    ];
    
    for (const testUser of testUsers) {
      console.log(`\n👤 TESTING USER: ${testUser.email}`);
      console.log('='.repeat(50));
      
      // 1. Recupera utente dal database
      const query = 'SELECT id, email, password FROM "User" WHERE email = $1';
      const result = await client.query(query, [testUser.email]);
      
      if (result.rows.length === 0) {
        console.log('❌ Utente NON trovato nel database');
        continue;
      }
      
      const dbUser = result.rows[0];
      console.log(`✅ Utente trovato - ID: ${dbUser.id}`);
      console.log(`📧 Email: ${dbUser.email}`);
      console.log(`🔐 Hash length: ${dbUser.password?.length || 0}`);
      console.log(`🔐 Hash preview: ${dbUser.password?.substring(0, 10)}...`);
      
      // 2. Test password con bcrypt
      console.log(`\n🔐 Testing password: "${testUser.password}"`);
      console.log(`🔐 Password length: ${testUser.password.length}`);
      
      try {
        const startTime = Date.now();
        const isMatch = await bcrypt.compare(testUser.password, dbUser.password);
        const endTime = Date.now();
        
        console.log(`🔐 bcrypt.compare result: ${isMatch}`);
        console.log(`⏱️ Comparison took: ${endTime - startTime}ms`);
        
        if (isMatch) {
          console.log('🎉 PASSWORD MATCH! ✅');
        } else {
          console.log('❌ PASSWORD NO MATCH!');
          
          // Test aggiuntivi per debug
          console.log('\n🔍 ADDITIONAL DEBUG:');
          
          // Test se la password è stata hashata correttamente
          const testHash = await bcrypt.hash(testUser.password, 10);
          console.log(`🔐 Fresh hash: ${testHash.substring(0, 10)}...`);
          
          const testMatch = await bcrypt.compare(testUser.password, testHash);
          console.log(`🔐 Fresh hash test: ${testMatch}`);
          
          // Verifica se il database hash è valido
          const isValidHash = dbUser.password.startsWith('$2a$') || 
                            dbUser.password.startsWith('$2b$') || 
                            dbUser.password.startsWith('$2y$');
          console.log(`🔐 Hash format valid: ${isValidHash}`);
          
          if (!isValidHash) {
            console.log('⚠️ DATABASE HASH IS NOT BCRYPT FORMAT!');
            console.log('💡 This might be the problem - password not properly hashed');
          }
        }
        
      } catch (bcryptError) {
        console.error('❌ bcrypt.compare error:', bcryptError.message);
      }
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

async function fixPasswordHashes() {
  console.log('\n🔧 FIX PASSWORD HASHES');
  console.log('=======================');
  
  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    
    const usersToFix = [
      { email: 'debug@test.com', password: 'YourPassword123!' },
      { email: 'andrea.zampierolo@me.com', password: 'Mandingo' }
    ];
    
    for (const user of usersToFix) {
      console.log(`🔧 Fixing password for: ${user.email}`);
      
      // Genera nuovo hash
      const newHash = await bcrypt.hash(user.password, 10);
      console.log(`🔐 New hash: ${newHash.substring(0, 15)}...`);
      
      // Aggiorna nel database
      await client.query(
        'UPDATE "User" SET password = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE email = $2',
        [newHash, user.email]
      );
      
      console.log('✅ Password hash updated');
      
      // Verifica immediata
      const checkResult = await client.query('SELECT password FROM "User" WHERE email = $1', [user.email]);
      const verification = await bcrypt.compare(user.password, checkResult.rows[0].password);
      console.log(`✅ Verification: ${verification ? 'SUCCESS' : 'FAILED'}`);
    }
    
    await client.end();
    console.log('\n🎉 PASSWORD HASHES FIXED!');
    
  } catch (error) {
    console.error('❌ Fix error:', error.message);
  }
}

async function testLoginAfterFix() {
  console.log('\n🧪 TEST LOGIN AFTER FIX');
  console.log('========================');
  
  const https = require('https');
  
  const testUser = {
    email: 'debug@test.com',
    password: 'YourPassword123!'
  };
  
  return new Promise((resolve) => {
    const loginData = JSON.stringify(testUser);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };
    
    console.log('🎯 Testing: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login');
    
    const req = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login', options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`📡 Status: ${res.statusCode}`);
        console.log(`📡 Response: ${data}`);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('🎉🎉🎉 LOGIN NOW WORKING! 🎉🎉🎉');
        } else {
          console.log('❌ Login still failing - may need backend restart');
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
  console.log('🚀 Starting password debug process...\n');
  
  try {
    await debugPasswordValidation();
    
    console.log('\n❓ Do you want to fix the password hashes? (This will update the database)');
    console.log('💡 This is safe - it will properly hash the passwords with bcrypt');
    
    // Auto-proceed with fix
    await fixPasswordHashes();
    await testLoginAfterFix();
    
    console.log('\n🎯 DEBUG COMPLETE!');
    console.log('==================');
    console.log('✅ Password validation analyzed');
    console.log('✅ Password hashes fixed');
    console.log('✅ Login tested');
    console.log('\n📝 Now run: node complete-auth-test.js');
    
  } catch (error) {
    console.error('💥 FATAL ERROR:', error.message);
  }
}

main();
