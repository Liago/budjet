#!/usr/bin/env node

const https = require('https');

// Test data
const testUser = {
  email: 'test@example.com', 
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
};

const API_BASE = 'https://bud-jet-be.netlify.app/.netlify/functions/api';

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    
    console.log(`🌐 Testing: ${method} ${API_BASE + path}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'Accept': 'application/json',
        'User-Agent': 'Auth-Test/1.0'
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuth() {
  console.log('🔐 TESTING AUTHENTICATION NOW THAT INJECTION WORKS...');
  console.log('=====================================================\n');
  
  try {
    // Test 1: Registration
    console.log('1️⃣ Testing Registration...');
    console.log('─'.repeat(50));
    
    const registerResult = await makeRequest('/auth/register', 'POST', testUser);
    
    console.log(`📊 Status: ${registerResult.statusCode}`);
    console.log(`📦 Response:`, JSON.stringify(registerResult.data, null, 2));
    
    if (registerResult.statusCode === 201) {
      console.log('🎉 REGISTRATION SUCCESS!');
    } else if (registerResult.statusCode === 409) {
      console.log('⚠️ User already exists (this is OK for testing)');
    } else if (registerResult.statusCode === 500) {
      console.log('❌ Registration failed - check logs for database issues');
    } else {
      console.log('❓ Unexpected registration status');
    }
    
    console.log('');
    
    // Test 2: Login
    console.log('2️⃣ Testing Login...');
    console.log('─'.repeat(50));
    
    const loginResult = await makeRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log(`📊 Status: ${loginResult.statusCode}`);
    console.log(`📦 Response:`, JSON.stringify(loginResult.data, null, 2));
    
    if (loginResult.statusCode === 200) {
      console.log('🎉 LOGIN SUCCESS!');
      console.log('✅ JWT TOKEN GENERATED!');
      console.log('🚀 AUTHENTICATION IS FULLY WORKING!');
    } else if (loginResult.statusCode === 401) {
      console.log('❌ Login failed - invalid credentials or user not found');
    } else if (loginResult.statusCode === 500) {
      console.log('❌ Login failed - server error (check logs)');
    } else {
      console.log('❓ Unexpected login status');
    }
    
    console.log('');
    console.log('🎯 SUMMARY:');
    console.log('===========');
    console.log(`Registration: ${registerResult.statusCode === 201 || registerResult.statusCode === 409 ? '✅' : '❌'} (${registerResult.statusCode})`);
    console.log(`Login: ${loginResult.statusCode === 200 ? '✅' : '❌'} (${loginResult.statusCode})`);
    
    if (registerResult.statusCode === 201 && loginResult.statusCode === 200) {
      console.log('🎉 FULL AUTHENTICATION STACK WORKING!');
    } else if (registerResult.statusCode === 500 || loginResult.statusCode === 500) {
      console.log('🔍 Database connection issues - but injection works!');
      console.log('💡 Next step: Optimize database connection');
    } else {
      console.log('🔍 Check Netlify logs for specific error details');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testAuth();
