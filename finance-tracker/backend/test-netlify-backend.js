#!/usr/bin/env node

/**
 * 🌐 NETLIFY BACKEND TEST - Test del backend deployato su Netlify
 */

const https = require('https');

const NETLIFY_API_URL = 'https://bud-jet-be.netlify.app/.netlify/functions/api';

function makeNetlifyRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(NETLIFY_API_URL + path);
    
    console.log(`🌐 Testing: ${method} ${NETLIFY_API_URL + path}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'Accept': 'application/json',
        'User-Agent': 'Netlify-Test/1.0',
        ...headers
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

async function testNetlifyBackend() {
  console.log('🌐 NETLIFY BACKEND DIAGNOSTIC TEST');
  console.log('===================================');
  console.log(`🎯 Testing backend: ${NETLIFY_API_URL}`);
  console.log('');
  
  try {
    // Test 1: Base API health check
    console.log('1️⃣ Testing basic connectivity...');
    console.log('─'.repeat(50));
    
    try {
      const healthCheck = await makeNetlifyRequest('/');
      console.log('✅ Base API is reachable');
      console.log(`📊 Status: ${healthCheck.statusCode}`);
    } catch (error) {
      console.log('❌ Base API connectivity failed:', error.message);
      console.log('🔍 This could indicate:');
      console.log('   - Netlify function not deployed');
      console.log('   - Function has runtime errors');
      console.log('   - URL is incorrect');
    }
    
    console.log('');
    
    // Test 2: CORS Preflight
    console.log('2️⃣ Testing CORS preflight...');
    console.log('─'.repeat(50));
    
    try {
      const corsTest = await makeNetlifyRequest('/auth/login', 'OPTIONS');
      console.log(`📊 CORS Status: ${corsTest.statusCode}`);
      
      if (corsTest.statusCode === 200) {
        console.log('✅ CORS preflight successful');
        console.log('🔍 CORS headers received:');
        Object.keys(corsTest.headers).forEach(key => {
          if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('access-control')) {
            console.log(`   ${key}: ${corsTest.headers[key]}`);
          }
        });
      } else {
        console.log('❌ CORS preflight failed');
        console.log('🔍 This could indicate CORS configuration issues');
      }
    } catch (error) {
      console.log('❌ CORS test failed:', error.message);
    }
    
    console.log('');
    
    // Test 3: Login endpoint
    console.log('3️⃣ Testing login endpoint...');
    console.log('─'.repeat(50));
    
    try {
      const loginTest = await makeNetlifyRequest('/auth/login', 'POST', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      console.log(`📊 Login Status: ${loginTest.statusCode}`);
      
      if (loginTest.statusCode === 200) {
        console.log('🎉 LOGIN SUCCESSFUL ON NETLIFY!');
        console.log('✅ Backend is working correctly');
      } else if (loginTest.statusCode === 401) {
        console.log('⚠️ Login rejected (401) - this is actually GOOD!');
        console.log('✅ It means the backend is working, just wrong credentials');
        console.log('🔍 Try with correct credentials or create a user first');
      } else if (loginTest.statusCode === 500) {
        console.log('❌ LOGIN FAILED - Server Error (500)');
        console.log('🔍 This indicates backend issues:');
        console.log('   - Database connection problems');
        console.log('   - Missing environment variables');
        console.log('   - Runtime errors in the function');
        
        if (loginTest.data && typeof loginTest.data === 'object') {
          console.log('🔍 Error details:', JSON.stringify(loginTest.data, null, 2));
        }
      } else {
        console.log(`❓ Unexpected status: ${loginTest.statusCode}`);
      }
      
    } catch (error) {
      console.log('❌ Login test failed:', error.message);
    }
    
    console.log('');
    
    // Test 4: Registration endpoint
    console.log('4️⃣ Testing registration endpoint...');
    console.log('─'.repeat(50));
    
    try {
      const regTest = await makeNetlifyRequest('/auth/register', 'POST', {
        email: 'netlifytest@example.com',
        password: 'password123',
        firstName: 'Netlify',
        lastName: 'Test'
      });
      
      console.log(`📊 Registration Status: ${regTest.statusCode}`);
      
      if (regTest.statusCode === 201) {
        console.log('🎉 REGISTRATION SUCCESSFUL!');
        console.log('✅ Backend fully operational');
      } else if (regTest.statusCode === 409) {
        console.log('⚠️ User already exists - this is normal');
        console.log('✅ Backend is working correctly');
      } else if (regTest.statusCode === 500) {
        console.log('❌ REGISTRATION FAILED - Server Error');
        if (regTest.data && typeof regTest.data === 'object') {
          console.log('🔍 Error details:', JSON.stringify(regTest.data, null, 2));
        }
      }
      
    } catch (error) {
      console.log('❌ Registration test failed:', error.message);
    }
    
    console.log('');
    console.log('🎯 SUMMARY & RECOMMENDATIONS:');
    console.log('==============================');
    console.log('If you see 500 errors:');
    console.log('1. 🔍 Check Netlify Function logs');
    console.log('2. ⚙️ Verify environment variables are set');
    console.log('3. 🗄️ Verify database is accessible from Netlify');
    console.log('');
    console.log('If you see CORS errors:');
    console.log('1. 🌐 Check netlify.toml CORS configuration');
    console.log('2. 🔧 Verify frontend origin is in allowed list');
    console.log('');
    console.log('If everything works:');
    console.log('🎉 Backend is operational! Check frontend configuration.');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run test
testNetlifyBackend();
