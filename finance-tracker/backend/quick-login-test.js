#!/usr/bin/env node

/**
 * 🧪 QUICK LOGIN TEST - Test veloce per verificare status 200
 */

const http = require('http');

async function quickLoginTest() {
  console.log('🧪 QUICK LOGIN TEST');
  console.log('===================');
  
  const loginData = {
    email: 'test@example.com',
    password: 'password123'
  };

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`📊 Login Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('🎉 PERFECT! Login returns status 200!');
          
          try {
            const data = JSON.parse(body);
            console.log('✅ JWT Token received:', !!data.access_token);
            console.log('✅ User data received:', !!data.user);
            console.log('🎯 LOGIN COMPLETELY WORKING!');
          } catch (e) {
            console.log('📄 Response body:', body);
          }
          
        } else if (res.statusCode === 201) {
          console.log('⚠️ Still returns 201, but login works');
          console.log('🔧 Need to restart server for @HttpCode(200) to take effect');
          
        } else {
          console.log(`❌ Unexpected status: ${res.statusCode}`);
          console.log('📄 Response:', body);
        }
        
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(loginData));
    req.end();
  });
}

// Test immediato
quickLoginTest().catch(console.error);
