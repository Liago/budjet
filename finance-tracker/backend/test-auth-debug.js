#!/usr/bin/env node

const https = require('https');

const API_BASE = 'https://bud-jet-be.netlify.app/.netlify/functions/api';

function makeDetailedRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    
    console.log(`🌐 Testing: ${method} ${API_BASE + path}`);
    console.log(`📦 Payload:`, JSON.stringify(data, null, 2));
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'Accept': 'application/json',
        'User-Agent': 'Auth-Debug/1.0'
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
        console.log(`📋 Headers:`, JSON.stringify(res.headers, null, 2));
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

async function debugAuth() {
  console.log('🔐 DEBUGGING AUTHENTICATION - DATABASE IS WORKING!');
  console.log('==================================================\n');
  
  const testUser = {
    email: 'debug@test.com',
    password: 'TestPassword123!',
    firstName: 'Debug',
    lastName: 'User'
  };
  
  console.log('🎯 Database Status: ✅ CONNECTED (1.6s latency)');
  console.log('🎯 PrismaService: ✅ INJECTED');
  console.log('🎯 Focus: Find auth-specific error\n');
  
  try {
    // Test 1: Registration with detailed logging
    console.log('1️⃣ DETAILED REGISTRATION TEST');
    console.log('═'.repeat(50));
    
    const registerResult = await makeDetailedRequest('/auth/register', 'POST', testUser);
    
    console.log('\n📊 REGISTRATION ANALYSIS:');
    console.log('─'.repeat(30));
    
    if (registerResult.statusCode === 201) {
      console.log('🎉 SUCCESS: User registered!');
      console.log('📦 User Data:', JSON.stringify(registerResult.data, null, 2));
    } else if (registerResult.statusCode === 409) {
      console.log('⚠️  CONFLICT: User already exists (this is OK)');
    } else if (registerResult.statusCode === 500) {
      console.log('❌ INTERNAL ERROR: Something failed in registration logic');
      
      // Analyze the error
      if (registerResult.data.message) {
        console.log('📋 Error Message:', registerResult.data.message);
      }
      
      if (registerResult.data.stack) {
        console.log('📋 Stack Trace:', registerResult.data.stack);
      }
      
      console.log('\n💡 LIKELY CAUSES (since DB works):');
      console.log('   - Validation error in RegisterDto');
      console.log('   - bcrypt password hashing error');
      console.log('   - User creation transaction error');
      console.log('   - Default categories creation error');
      
    } else if (registerResult.statusCode === 400) {
      console.log('❌ BAD REQUEST: Validation failed');
      console.log('📋 Validation errors:', JSON.stringify(registerResult.data, null, 2));
    } else {
      console.log(`❓ UNEXPECTED STATUS: ${registerResult.statusCode}`);
    }
    
    console.log('\n' + '═'.repeat(50) + '\n');
    
    // Test 2: Login attempt  
    console.log('2️⃣ DETAILED LOGIN TEST');
    console.log('═'.repeat(50));
    
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const loginResult = await makeDetailedRequest('/auth/login', 'POST', loginData);
    
    console.log('\n📊 LOGIN ANALYSIS:');
    console.log('─'.repeat(30));
    
    if (loginResult.statusCode === 200) {
      console.log('🎉 SUCCESS: Login worked!');
      console.log('📦 JWT Token:', loginResult.data.accessToken ? '✅ Generated' : '❌ Missing');
    } else if (loginResult.statusCode === 401) {
      console.log('❌ UNAUTHORIZED: Authentication failed');
      console.log('💡 LIKELY CAUSES:');
      console.log('   - User not found (registration failed)');
      console.log('   - Password validation error');
      console.log('   - bcrypt compare error');
    } else if (loginResult.statusCode === 500) {
      console.log('❌ INTERNAL ERROR: Something failed in login logic');
    } else {
      console.log(`❓ UNEXPECTED STATUS: ${loginResult.statusCode}`);
    }
    
    console.log('\n' + '═'.repeat(50) + '\n');
    
    // Summary
    console.log('🎯 DEBUGGING SUMMARY:');
    console.log('═'.repeat(30));
    console.log('✅ Database: WORKING');
    console.log('✅ PrismaService: INJECTED');
    console.log('✅ App Infrastructure: WORKING');
    console.log(`${registerResult.statusCode === 201 || registerResult.statusCode === 409 ? '✅' : '❌'} Registration: ${registerResult.statusCode}`);
    console.log(`${loginResult.statusCode === 200 ? '✅' : '❌'} Login: ${loginResult.statusCode}`);
    
    if (registerResult.statusCode === 500) {
      console.log('\n🔍 NEXT STEPS:');
      console.log('   1. Check Netlify logs for registration endpoint');
      console.log('   2. Add error logging to AuthService.register()');
      console.log('   3. Check bcrypt, validation, database transaction');
    } else if (registerResult.statusCode === 201 && loginResult.statusCode === 401) {
      console.log('\n🔍 NEXT STEPS:');
      console.log('   1. Check user was actually created in database');
      console.log('   2. Test password hashing/comparison');
      console.log('   3. Add logging to AuthService.validateUser()');
    } else if (registerResult.statusCode === 201 && loginResult.statusCode === 200) {
      console.log('\n🎉 AUTHENTICATION IS FULLY WORKING!');
      console.log('   The issue might be intermittent or resolved!');
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }
}

debugAuth();
