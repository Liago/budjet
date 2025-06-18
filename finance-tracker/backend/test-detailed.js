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
    
    console.log(`🌐 Making ${method} request to: ${API_BASE + path}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'Accept': 'application/json',
        'User-Agent': 'Test-Script/1.0'
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    console.log('📝 Request headers:', JSON.stringify(options.headers, null, 2));
    if (data) {
      console.log('📦 Request body:', JSON.stringify(data, null, 2));
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      console.log(`📈 Response status: ${res.statusCode}`);
      console.log('📝 Response headers:', JSON.stringify(res.headers, null, 2));
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📦 Raw response:', responseData);
        
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
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.setTimeout(30000, () => {
      console.error('⏰ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function detailedTest() {
  console.log('🧪 DETAILED AUTHENTICATION TEST...');
  console.log('=====================================\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    console.log('------------------------------------');
    
    try {
      const healthCheck = await makeRequest('/health', 'GET');
      console.log('✅ API is reachable\n');
    } catch (error) {
      console.log('❌ API connectivity failed:', error.message);
      console.log('🔍 Check if the Netlify deployment is complete\n');
    }
    
    // Test 2: Registration with detailed logging
    console.log('2️⃣ Testing Registration...');
    console.log('-----------------------------');
    
    const registerResult = await makeRequest('/auth/register', 'POST', testUser);
    
    console.log(`📊 Registration Status: ${registerResult.statusCode}`);
    console.log(`📋 Registration Response:`, JSON.stringify(registerResult.data, null, 2));
    
    if (registerResult.statusCode === 500) {
      console.log('❌ REGISTRATION FAILED WITH 500');
      console.log('🔍 Check Netlify Function logs for the specific error');
      console.log('💡 Common causes:');
      console.log('   - Missing JWT_SECRET environment variable');
      console.log('   - Database connection issues');
      console.log('   - Prisma client not generated properly');
      console.log('   - Schema mismatch between local and production');
    }
    
    console.log('');
    
    // Test 3: Login attempt
    console.log('3️⃣ Testing Login...');
    console.log('-------------------');
    
    const loginResult = await makeRequest('/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log(`📊 Login Status: ${loginResult.statusCode}`);
    console.log(`📋 Login Response:`, JSON.stringify(loginResult.data, null, 2));
    
    if (loginResult.statusCode === 401) {
      console.log('❌ LOGIN FAILED WITH 401');
      console.log('🔍 Possible causes:');
      console.log('   - User does not exist (registration failed)');
      console.log('   - Password validation issues');
      console.log('   - LocalStrategy configuration problems');
    }
    
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('==============');
    console.log('1. Check Netlify Function logs for detailed error messages');
    console.log('2. Verify environment variables are set correctly');
    console.log('3. Ensure latest code is deployed');
    console.log('4. Check database connectivity');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run detailed test
detailedTest();
