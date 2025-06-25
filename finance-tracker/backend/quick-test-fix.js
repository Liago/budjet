#!/usr/bin/env node

/**
 * 🧪 QUICK TEST - Verifica veloce che il problema 500 sia risolto
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body
        });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function quickTest() {
  console.log('🧪 QUICK BACKEND FIX VERIFICATION');
  console.log('==================================');
  
  try {
    // 1. Test debug health (non protetto)
    console.log('\n1️⃣ Testing debug health endpoint...');
    const health = await makeRequest('/api/debug/health');
    console.log(`   Status: ${health.status} ${health.status === 200 ? '✅' : '❌'}`);
    
    // 2. Test login
    console.log('\n2️⃣ Testing login...');
    const login = await makeRequest('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log(`   Status: ${login.status} ${login.status === 200 ? '✅' : '❌'}`);
    
    let token = null;
    if (login.status === 200) {
      try {
        const loginData = JSON.parse(login.body);
        token = loginData.access_token;
        console.log(`   Token obtained: ${token ? '✅' : '❌'}`);
      } catch (e) {
        console.log(`   Token parse error: ❌`);
      }
    }
    
    if (token) {
      // 3. Test debug auth endpoint
      console.log('\n3️⃣ Testing debug auth endpoint...');
      const authTest = await makeRequest('/api/debug/auth-test', 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      console.log(`   Status: ${authTest.status} ${authTest.status === 200 ? '✅' : '❌'}`);
      
      // 4. Test categories (il problema principale)
      console.log('\n4️⃣ Testing categories endpoint...');
      const categories = await makeRequest('/api/categories', 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      console.log(`   Status: ${categories.status} ${categories.status === 200 ? '✅' : '❌'}`);
      
      // 5. Test transactions
      console.log('\n5️⃣ Testing transactions endpoint...');
      const transactions = await makeRequest('/api/transactions', 'GET', null, {
        'Authorization': `Bearer ${token}`
      });
      console.log(`   Status: ${transactions.status} ${transactions.status === 200 ? '✅' : '❌'}`);
      
      // Summary
      console.log('\n🎯 RISULTATI:');
      console.log('==============');
      const allWorking = health.status === 200 && 
                        login.status === 200 && 
                        authTest.status === 200 && 
                        categories.status === 200 && 
                        transactions.status === 200;
      
      if (allWorking) {
        console.log('🎉 PROBLEMA RISOLTO! Tutti gli endpoint funzionano!');
        console.log('✅ Backend è completamente operativo');
      } else {
        console.log('⚠️ Alcuni endpoint hanno ancora problemi');
        console.log('🔍 Controlla i logs del server per dettagli');
      }
      
    } else {
      console.log('\n❌ Cannot test protected endpoints - login failed');
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    console.log('💡 Make sure server is running: npm run start:dev');
  }
}

quickTest();
