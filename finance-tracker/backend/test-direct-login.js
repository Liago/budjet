#!/usr/bin/env node

const https = require('https');

const API_BASE = 'https://bud-jet-be.netlify.app/.netlify/functions/api';

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    
    console.log(`🌐 Testing: ${method} ${API_BASE + path}`);
    if (data) {
      console.log(`📦 Payload:`, JSON.stringify(data, null, 2));
    }
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'Accept': 'application/json',
        'User-Agent': 'TestLogin-Direct/1.0'
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
        console.log(`📈 Status: ${res.statusCode}`);
        console.log(`📦 Raw Response:`, responseData);
        
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

async function testDirectLogin() {
  console.log('🧪 TESTING DIRECT LOGIN (NO GUARDS)');
  console.log('====================================\n');
  
  // Use the user we know was created successfully
  const loginData = {
    email: 'debug@test.com',
    password: 'TestPassword123!'
  };
  
  console.log('🎯 Testing both normal login and direct login:\n');
  
  try {
    // Test 1: Normal login with guards (for comparison)
    console.log('1️⃣ NORMAL LOGIN (with LocalAuthGuard)');
    console.log('═'.repeat(50));
    
    const normalResult = await makeRequest('/auth/login', 'POST', loginData);
    
    console.log('\n📊 Normal Login Result:');
    console.log(`Status: ${normalResult.statusCode}`);
    console.log(`Response:`, JSON.stringify(normalResult.data, null, 2));
    
    console.log('\n' + '═'.repeat(50) + '\n');
    
    // Test 2: Direct login without guards
    console.log('2️⃣ DIRECT LOGIN (bypassing guards)');
    console.log('═'.repeat(50));
    
    const directResult = await makeRequest('/auth/test-login', 'POST', loginData);
    
    console.log('\n📊 Direct Login Result:');
    console.log(`Status: ${directResult.statusCode}`);
    console.log(`Response:`, JSON.stringify(directResult.data, null, 2));
    
    console.log('\n' + '═'.repeat(50) + '\n');
    
    // Analysis
    console.log('🎯 ANALYSIS:');
    console.log('═'.repeat(20));
    
    if (normalResult.statusCode === 200) {
      console.log('✅ Normal login: SUCCESS');
      console.log('🎉 Guards are working correctly!');
    } else if (normalResult.statusCode === 401) {
      console.log('❌ Normal login: FAILED (401)');
      
      if (directResult.statusCode === 200) {
        console.log('✅ Direct login: SUCCESS');
        console.log('🔍 DIAGNOSIS: Guards/LocalStrategy are the problem');
        console.log('🛠️ FIX NEEDED: LocalAuthGuard configuration');
      } else {
        console.log('❌ Direct login: ALSO FAILED');
        console.log('🔍 DIAGNOSIS: Core authentication logic problem');
        console.log('🛠️ FIX NEEDED: AuthService.validateUser or login method');
      }
    } else {
      console.log(`❓ Normal login: Unexpected status ${normalResult.statusCode}`);
    }
    
    // Detailed direct login analysis
    if (directResult.statusCode === 200 && directResult.data.success) {
      console.log('\n🎉 DIRECT LOGIN SUCCESS!');
      console.log('✅ AuthService.validateUser: WORKING');
      console.log('✅ AuthService.login: WORKING');
      console.log('✅ JWT Generation: WORKING');
      console.log('✅ Core authentication: WORKING');
      
      if (normalResult.statusCode === 401) {
        console.log('\n🔍 ROOT CAUSE: LocalAuthGuard/Passport issue');
        console.log('💡 SOLUTION: Fix guard configuration or strategy');
      }
      
    } else if (directResult.statusCode === 200 && !directResult.data.success) {
      console.log('\n❌ DIRECT LOGIN FAILED');
      console.log(`🔍 Failed at step: ${directResult.data.step}`);
      console.log(`🔍 Error: ${directResult.data.message}`);
      
      if (directResult.data.step === 'validateUser returned null') {
        console.log('💡 SOLUTION: Check user lookup or password comparison');
      } else {
        console.log('💡 SOLUTION: Check JWT generation or login method');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectLogin();
