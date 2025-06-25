#!/usr/bin/env node

/**
 * 🔧 TEST ENDPOINTS - Script per verificare lo stato degli endpoints
 * 
 * Questo script testa tutti gli endpoints per identificare
 * il problema che causa errori 500
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test data
const testEndpoints = [
  // Non-protected endpoints
  { method: 'GET', path: '/', name: 'Root' },
  { method: 'GET', path: '/api', name: 'API Root' },
  
  // Auth endpoints (should work)
  { method: 'POST', path: '/api/auth/login', name: 'Login', body: { email: 'test@example.com', password: 'test123' } },
  
  // Protected endpoints (problematic)
  { method: 'GET', path: '/api/categories', name: 'Categories' },
  { method: 'GET', path: '/api/transactions', name: 'Transactions' },
  { method: 'GET', path: '/api/dashboard', name: 'Dashboard' },
  { method: 'GET', path: '/api/users/profile', name: 'User Profile' },
];

// Simple HTTP request helper
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
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

// Test function
async function testEndpoint(endpoint) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: endpoint.path,
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (endpoint.body) {
    options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(endpoint.body));
  }

  try {
    const result = await makeRequest(options, endpoint.body);
    console.log(`✅ ${endpoint.name}: ${result.status}`);
    
    if (result.status >= 400) {
      console.log(`   📄 Body: ${result.body.substring(0, 200)}...`);
    }
    
    return result;
  } catch (error) {
    console.log(`❌ ${endpoint.name}: ERROR - ${error.message}`);
    return { error: error.message };
  }
}

// Main test function
async function runTests() {
  console.log('🧪 TESTING BACKEND ENDPOINTS');
  console.log('================================');
  
  // Test server availability first
  console.log('\n1️⃣ Testing server availability...');
  try {
    await makeRequest({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' });
    console.log('✅ Server is running');
  } catch (error) {
    console.log('❌ Server is not running or not accessible');
    console.log('💡 Make sure to run: npm run start:dev');
    process.exit(1);
  }

  console.log('\n2️⃣ Testing endpoints...');
  
  for (const endpoint of testEndpoints) {
    await testEndpoint(endpoint);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }

  console.log('\n================================');
  console.log('🏁 Test completed');
  console.log('\n💡 If you see many 500 errors, check the server logs for more details');
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };
