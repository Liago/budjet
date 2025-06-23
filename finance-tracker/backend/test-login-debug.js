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
        'User-Agent': 'Login-Debug/1.0'
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

async function debugLogin() {
  console.log('🔐 DEBUGGING LOGIN - REGISTRATION WORKS!');
  console.log('=========================================\n');
  
  // Usa l'utente che sappiamo è stato creato con successo
  const loginData = {
    email: 'debug@test.com',
    password: 'TestPassword123!'
  };
  
  console.log('🎯 Context:');
  console.log('✅ Registration: WORKING (user created in DB)');
  console.log('✅ Database: CONNECTED');
  console.log('✅ Dependency Injection: WORKING');
  console.log('❓ Login: NEEDS INVESTIGATION\n');
  
  try {
    console.log('🔍 DETAILED LOGIN TEST');
    console.log('═'.repeat(50));
    
    const result = await makeRequest('/auth/login', 'POST', loginData);
    
    console.log('\n📊 LOGIN ANALYSIS:');
    console.log('─'.repeat(30));
    
    if (result.statusCode === 200) {
      console.log('🎉 SUCCESS: Login worked!');
      console.log('📦 Response:', JSON.stringify(result.data, null, 2));
      
      if (result.data.accessToken) {
        console.log('✅ JWT Token generated successfully');
        console.log('🔑 Token length:', result.data.accessToken.length);
      } else {
        console.log('❌ JWT Token missing in response');
      }
      
    } else if (result.statusCode === 401) {
      console.log('❌ AUTHENTICATION FAILED (401)');
      console.log('📋 Error details:', JSON.stringify(result.data, null, 2));
      
      console.log('\n💡 POSSIBLE CAUSES FOR LOGIN 401:');
      console.log('   1. User not found in database lookup');
      console.log('   2. Password comparison failed (bcrypt.compare)');
      console.log('   3. LocalStrategy validation failed');
      console.log('   4. PassportJS authentication pipeline issue');
      
      console.log('\n🔍 INVESTIGATION NEEDED:');
      console.log('   - Check Netlify logs for AuthService.validateUser()');
      console.log('   - Check LocalStrategy.validate() execution');
      console.log('   - Verify password comparison logic');
      console.log('   - Test direct database user lookup');
      
    } else if (result.statusCode === 500) {
      console.log('❌ INTERNAL SERVER ERROR (500)');
      console.log('📋 This suggests a code error in login logic');
      
    } else {
      console.log(`❓ UNEXPECTED STATUS: ${result.statusCode}`);
      console.log('📋 Response:', JSON.stringify(result.data, null, 2));
    }
    
    console.log('\n' + '═'.repeat(50));
    
    // Test user lookup diretto per verificare che l'utente esista
    console.log('\n🔍 TESTING DIRECT USER LOOKUP');
    console.log('═'.repeat(50));
    
    console.log('💡 To verify the user exists, check Netlify logs for:');
    console.log('   - "📍 Validating user with email: deb***"');
    console.log('   - "📧 Looking up user by email..."');
    console.log('   - "👤 User found, verifying password..."');
    console.log('   - OR "❌ User not found with email: deb***"');
    
    console.log('\n🎯 NEXT STEPS BASED ON RESULT:');
    console.log('═'.repeat(50));
    
    if (result.statusCode === 401) {
      console.log('Since registration works but login fails:');
      console.log('1. Add detailed logging to LocalStrategy.validate()');
      console.log('2. Add detailed logging to AuthService.validateUser()');
      console.log('3. Test bcrypt.compare() specifically');
      console.log('4. Verify user lookup in login flow');
      
      console.log('\n🛠️ SUGGESTED FIXES:');
      console.log('- Add console.log in LocalStrategy before/after validateUser()');
      console.log('- Add console.log in validateUser() for each step');
      console.log('- Test password comparison with known hash');
    }
    
  } catch (error) {
    console.error('❌ Login debug test failed:', error.message);
  }
}

debugLogin();
