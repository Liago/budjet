#!/usr/bin/env node

/**
 * 🔧 LOCAL BACKEND TEST - Test specifico per il problema degli endpoint 500
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeLocalRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body,
          rawBody: body
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

async function testLocalBackend() {
  console.log('🧪 LOCAL BACKEND 500 ERROR TEST');
  console.log('=================================');
  
  // Step 1: Check if server is running
  console.log('\n1️⃣ Testing server connectivity...');
  try {
    const response = await makeLocalRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    console.log(`✅ Server responds: ${response.status}`);
    console.log(`📄 Response: ${response.body.substring(0, 100)}...`);
  } catch (error) {
    console.log('❌ Server not running. Please start with: npm run start:dev');
    return;
  }

  // Step 2: Test login (this should work)
  console.log('\n2️⃣ Testing login endpoint...');
  try {
    const loginResponse = await makeLocalRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log(`📊 Login Status: ${loginResponse.status}`);
    console.log(`📄 Login Body: ${loginResponse.body}`);
    
    let token = null;
    if (loginResponse.status === 200) {
      try {
        const loginData = JSON.parse(loginResponse.body);
        token = loginData.access_token;
        console.log(`✅ Login successful, token obtained: ${token ? 'YES' : 'NO'}`);
      } catch (e) {
        console.log('❌ Could not parse login response');
      }
    }

    // Step 3: Test protected endpoints with token
    if (token) {
      console.log('\n3️⃣ Testing protected endpoints with token...');
      
      const protectedEndpoints = [
        '/api/categories',
        '/api/transactions',
        '/api/dashboard',
        '/api/users/profile'
      ];

      for (const endpoint of protectedEndpoints) {
        try {
          const response = await makeLocalRequest({
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`📊 ${endpoint}: ${response.status}`);
          
          if (response.status === 500) {
            console.log(`❌ 500 ERROR on ${endpoint}`);
            console.log(`📄 Error body: ${response.body}`);
            
            // Try to parse error for more details
            try {
              const errorData = JSON.parse(response.body);
              console.log(`🔍 Error details: ${JSON.stringify(errorData, null, 2)}`);
            } catch (e) {
              console.log(`🔍 Raw error: ${response.body}`);
            }
          } else {
            console.log(`✅ ${endpoint} works: ${response.status}`);
          }
          
        } catch (error) {
          console.log(`❌ ${endpoint} failed: ${error.message}`);
        }
      }
    } else {
      console.log('\n❌ Cannot test protected endpoints - no token available');
    }

  } catch (error) {
    console.log(`❌ Login test failed: ${error.message}`);
  }

  console.log('\n🎯 ANALYSIS:');
  console.log('=============');
  console.log('If you see 500 errors above:');
  console.log('1. Check the server logs for detailed error messages');
  console.log('2. The error might be in JWT validation or PrismaService injection');
  console.log('3. Look for circular dependencies or missing imports');
  console.log('\n💡 Run this test while monitoring server logs: npm run start:dev');
}

// Run if called directly
if (require.main === module) {
  testLocalBackend().catch(console.error);
}
