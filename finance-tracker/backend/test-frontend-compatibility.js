#!/usr/bin/env node

/**
 * 🧪 FRONTEND-BACKEND COMPATIBILITY TEST
 * 
 * Test completo per verificare che frontend e backend siano compatibili
 */

const http = require('http');

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: body,
          headers: res.headers
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

async function testFrontendBackendCompatibility() {
  console.log('🧪 FRONTEND-BACKEND COMPATIBILITY TEST');
  console.log('=====================================');
  
  let token = null;
  
  try {
    // 1. Test login e verifica response format
    console.log('\n1️⃣ Testing login response format...');
    const loginResponse = await makeRequest({
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
    
    if (loginResponse.status === 200) {
      try {
        const loginData = JSON.parse(loginResponse.body);
        console.log('📦 Login Response Keys:', Object.keys(loginData));
        
        // Verifica frontend compatibility
        if (loginData.accessToken) {
          console.log('✅ Frontend Compatible: accessToken found');
          token = loginData.accessToken;
        } else if (loginData.access_token) {
          console.log('❌ Frontend Incompatible: access_token instead of accessToken');
          console.log('🔧 Need to fix backend response format');
          token = loginData.access_token;
        }
        
        if (loginData.user) {
          console.log('✅ User object found');
          console.log('👤 User fields:', Object.keys(loginData.user));
        }
        
      } catch (e) {
        console.log('❌ Could not parse login response');
        return;
      }
    } else {
      console.log('❌ Login failed');
      return;
    }

    // 2. Test protected endpoints with token
    if (token) {
      console.log('\n2️⃣ Testing protected endpoints...');
      
      const protectedEndpoints = [
        { path: '/api/users/me', name: 'User Profile' },
        { path: '/api/categories', name: 'Categories' },
        { path: '/api/transactions', name: 'Transactions' },
        { path: '/api/dashboard/stats', name: 'Dashboard Stats' },
        { path: '/api/recurrent-payments', name: 'Recurrent Payments' },
        { path: '/api/savings-goals', name: 'Savings Goals' }
      ];

      for (const endpoint of protectedEndpoints) {
        try {
          const response = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: endpoint.path,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`📊 ${endpoint.name}: ${response.status} ${response.status === 200 ? '✅' : '❌'}`);
          
          if (response.status === 200) {
            try {
              const data = JSON.parse(response.body);
              console.log(`   📦 Response type: ${Array.isArray(data) ? 'Array' : typeof data}`);
            } catch (e) {
              console.log(`   📦 Response: Non-JSON data`);
            }
          } else if (response.status === 401) {
            console.log(`   🚫 Unauthorized - Token might be invalid`);
          } else if (response.status === 404) {
            console.log(`   🔍 Endpoint not found - Check backend routes`);
          }
          
        } catch (error) {
          console.log(`❌ ${endpoint.name}: Connection error`);
        }
      }
    }

    // 3. Summary
    console.log('\n🎯 COMPATIBILITY SUMMARY:');
    console.log('==========================');
    
    if (loginResponse.status === 200 && token) {
      console.log('✅ Authentication: Working');
      
      const loginData = JSON.parse(loginResponse.body);
      if (loginData.accessToken) {
        console.log('✅ Token Format: Frontend Compatible');
      } else {
        console.log('❌ Token Format: Needs backend fix');
      }
      
      console.log('✅ Protected Endpoints: Test completed above');
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Start frontend: npm run start:dev');
      console.log('2. Test login in browser');
      console.log('3. Check Network tab for API calls');
      
    } else {
      console.log('❌ Authentication: Failed');
      console.log('🔧 Fix authentication before testing frontend');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendBackendCompatibility();
