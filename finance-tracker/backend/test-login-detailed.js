#!/usr/bin/env node

/**
 * 🔧 LOGIN SPECIFIC TEST - Test specifico per problemi di login
 */

const http = require('http');

async function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      }
    };

    console.log(`🌐 Making ${method} request to: http://localhost:3000${path}`);
    if (data) {
      console.log(`📦 Request body:`, JSON.stringify(data, null, 2));
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`📊 Response status: ${res.statusCode}`);
        console.log(`📋 Response headers:`, JSON.stringify(res.headers, null, 2));
        console.log(`📄 Response body:`, body);
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error:`, error);
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testLogin() {
  console.log('🔐 DETAILED LOGIN TEST');
  console.log('======================');
  
  try {
    // 1. Test server connectivity
    console.log('\n1️⃣ Testing server connectivity...');
    try {
      await makeRequest('/');
      console.log('✅ Server is reachable');
    } catch (error) {
      console.log('❌ Server is not reachable:', error.message);
      console.log('💡 Make sure server is running: npm run start:dev');
      return;
    }

    // 2. Test auth endpoint availability
    console.log('\n2️⃣ Testing auth endpoint...');
    try {
      const authTest = await makeRequest('/api/auth');
      console.log(`Auth endpoint response: ${authTest.status}`);
    } catch (error) {
      console.log('Auth endpoint test failed:', error.message);
    }

    // 3. Test registration first (to ensure user exists)
    console.log('\n3️⃣ Testing registration...');
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    try {
      const regResult = await makeRequest('/api/auth/register', 'POST', testUser);
      if (regResult.status === 201) {
        console.log('✅ Registration successful');
      } else if (regResult.status === 409) {
        console.log('✅ User already exists (OK for testing)');
      } else {
        console.log(`⚠️ Registration returned: ${regResult.status}`);
      }
    } catch (error) {
      console.log('Registration failed:', error.message);
    }

    // 4. Test login with detailed logging
    console.log('\n4️⃣ Testing login with detailed logging...');
    
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const loginResult = await makeRequest('/api/auth/login', 'POST', loginData);
      
      console.log('\n🎯 LOGIN ANALYSIS:');
      console.log('==================');
      
      if (loginResult.status === 200) {
        console.log('🎉 LOGIN SUCCESS!');
        
        try {
          const responseData = JSON.parse(loginResult.body);
          if (responseData.access_token) {
            console.log('✅ JWT Token received');
            console.log(`📝 Token preview: ${responseData.access_token.substring(0, 50)}...`);
          } else {
            console.log('❌ No access_token in response');
          }
        } catch (parseError) {
          console.log('❌ Could not parse login response as JSON');
        }
        
      } else if (loginResult.status === 401) {
        console.log('❌ LOGIN FAILED - Unauthorized (401)');
        console.log('🔍 Possible causes:');
        console.log('   - Wrong email or password');
        console.log('   - User not found');
        console.log('   - Password validation issue');
        
      } else if (loginResult.status === 500) {
        console.log('❌ LOGIN FAILED - Server Error (500)');
        console.log('🔍 Possible causes:');
        console.log('   - Database connection issue');
        console.log('   - JWT configuration problem'); 
        console.log('   - UsersService still has issues');
        
      } else {
        console.log(`❌ LOGIN FAILED - Unexpected status: ${loginResult.status}`);
      }
      
    } catch (error) {
      console.log('❌ Login request failed:', error.message);
    }

    // 5. Test alternative credentials
    console.log('\n5️⃣ Testing with alternative credentials...');
    const altLoginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };

    try {
      const altResult = await makeRequest('/api/auth/login', 'POST', altLoginData);
      console.log(`Alt login status: ${altResult.status}`);
    } catch (error) {
      console.log('Alt login failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

testLogin();
