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
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'Accept': 'application/json'
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
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuth() {
  console.log('🧪 TESTING AUTHENTICATION FIXES...\n');
  
  try {
    // Test 1: Registration
    console.log('1️⃣ Testing Registration...');
    const registerResult = await makeRequest('/auth/register', 'POST', testUser);
    console.log(`   Status: ${registerResult.statusCode}`);
    console.log(`   Response:`, JSON.stringify(registerResult.data, null, 2));
    
    if (registerResult.statusCode === 201 || registerResult.statusCode === 409) {
      console.log('   ✅ Registration endpoint working\n');
    } else {
      console.log('   ❌ Registration failed\n');
      return;
    }
    
    // Test 2: Login
    console.log('2️⃣ Testing Login...');
    const loginResult = await makeRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    console.log(`   Status: ${loginResult.statusCode}`);
    console.log(`   Response:`, JSON.stringify(loginResult.data, null, 2));
    
    if (loginResult.statusCode === 200) {
      console.log('   ✅ Login successful!');
      console.log('   🎉 AUTHENTICATION IS WORKING!');
    } else {
      console.log('   ❌ Login failed');
      console.log('   🔍 Check logs for details');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testAuth();
