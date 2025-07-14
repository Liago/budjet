#!/usr/bin/env node

/**
 * 🔧 SCRIPT DI DEBUG SPECIFICO PER PROBLEMA LOGIN
 * Questo script diagnostica il problema di login 401 sul backend Netlify
 */

const https = require('https');
const http = require('http');

const NETLIFY_API_URL = 'https://bud-jet-be.netlify.app/.netlify/functions/api';

console.log('🔧 DEBUG LOGIN NETLIFY - Script Diagnostico');
console.log('============================================');
console.log(`🎯 Target API: ${NETLIFY_API_URL}`);
console.log('');

function makeRequest(url, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const requester = isHttps ? https : http;
    const urlObj = new URL(url);
    
    console.log(`🌐 ${method} ${url}`);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'User-Agent': 'DebugScript/1.0',
        ...headers
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      console.log(`📦 Request body: ${jsonData}`);
    }
    
    const req = requester.request(options, (res) => {
      let responseData = '';
      
      console.log(`📊 Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('📝 Response headers:');
      Object.keys(res.headers).forEach(key => {
        if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('access-control')) {
          console.log(`   ${key}: ${res.headers[key]}`);
        }
      });
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📦 Response: ${responseData}`);
        
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: parsedData,
            raw: responseData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: responseData,
            raw: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Request error: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(30000, () => {
      console.error('⏰ Request timeout (30s)');
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (data) {
      try {
        req.write(JSON.stringify(data));
      } catch (writeError) {
        console.error('❌ Error writing request data:', writeError.message);
      }
    }
    
    req.end();
  });
}

async function runDiagnostics() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    }
  };

  const testCases = [
    {
      name: 'connectivity',
      description: 'Base API Connectivity',
      url: NETLIFY_API_URL + '/',
      method: 'GET'
    },
    {
      name: 'cors_preflight',
      description: 'CORS Preflight Check',
      url: NETLIFY_API_URL + '/auth/login',
      method: 'OPTIONS'
    },
    {
      name: 'health_check',
      description: 'Health Check Endpoint',
      url: NETLIFY_API_URL + '/health',
      method: 'GET'
    },
    {
      name: 'register_user',
      description: 'User Registration',
      url: NETLIFY_API_URL + '/auth/register',
      method: 'POST',
      data: {
        email: 'debug@example.com',
        password: 'DebugPassword123!',
        firstName: 'Debug',
        lastName: 'User'
      }
    },
    {
      name: 'test_login_debug',
      description: 'Test Login (Bypasses Guards)',
      url: NETLIFY_API_URL + '/auth/test-login',
      method: 'POST',
      data: {
        email: 'debug@example.com',
        password: 'DebugPassword123!'
      }
    },
    {
      name: 'normal_login',
      description: 'Normal Login Flow',
      url: NETLIFY_API_URL + '/auth/login',
      method: 'POST',
      data: {
        email: 'debug@example.com',
        password: 'DebugPassword123!'
      }
    },
    {
      name: 'andrea_login',
      description: 'Login with Andrea Account',
      url: NETLIFY_API_URL + '/auth/login',
      method: 'POST',
      data: {
        email: 'andrea.zampierolo@me.com',
        password: 'Mandingo'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TEST: ${testCase.description}`);
    console.log(`${'='.repeat(60)}`);
    
    results.summary.total++;
    
    try {
      const result = await makeRequest(
        testCase.url,
        testCase.method,
        testCase.data
      );
      
      results.tests[testCase.name] = {
        description: testCase.description,
        success: result.statusCode >= 200 && result.statusCode < 400,
        statusCode: result.statusCode,
        statusMessage: result.statusMessage,
        data: result.data,
        raw: result.raw
      };
      
      // Analisi specifica per ogni test
      if (testCase.name === 'connectivity') {
        if (result.statusCode === 200) {
          console.log('✅ Backend is reachable and responding');
          results.summary.passed++;
        } else {
          console.log('❌ Backend connectivity issues');
          results.summary.failed++;
          results.summary.errors.push('Backend not reachable');
        }
      } else if (testCase.name === 'cors_preflight') {
        if (result.statusCode === 200) {
          console.log('✅ CORS is properly configured');
          results.summary.passed++;
        } else {
          console.log('❌ CORS configuration issues');
          results.summary.failed++;
          results.summary.errors.push('CORS not configured properly');
        }
      } else if (testCase.name === 'register_user') {
        if (result.statusCode === 201) {
          console.log('✅ User registration successful');
          results.summary.passed++;
        } else if (result.statusCode === 409) {
          console.log('ℹ️ User already exists (this is OK for testing)');
          results.summary.passed++;
        } else if (result.statusCode === 500) {
          console.log('❌ Server error during registration - DB or env issues');
          results.summary.failed++;
          results.summary.errors.push('Server error in registration');
        } else {
          console.log(`❌ Registration failed with status ${result.statusCode}`);
          results.summary.failed++;
          results.summary.errors.push(`Registration failed: ${result.statusCode}`);
        }
      } else if (testCase.name === 'test_login_debug') {
        if (result.statusCode === 200 && result.data && result.data.success) {
          console.log('✅ Debug login successful - AuthService is working');
          results.summary.passed++;
        } else if (result.statusCode === 200 && result.data && !result.data.success) {
          console.log('❌ Debug login failed - Issue in AuthService validation');
          console.log(`🔍 Failure reason: ${result.data.message}`);
          results.summary.failed++;
          results.summary.errors.push(`Debug login failed: ${result.data.message}`);
        } else {
          console.log(`❌ Debug login endpoint error: ${result.statusCode}`);
          results.summary.failed++;
          results.summary.errors.push(`Debug login error: ${result.statusCode}`);
        }
      } else if (testCase.name === 'normal_login' || testCase.name === 'andrea_login') {
        if (result.statusCode === 200) {
          console.log('🎉 LOGIN SUCCESSFUL! Backend is working perfectly.');
          results.summary.passed++;
        } else if (result.statusCode === 401) {
          console.log('❌ Login failed (401) - Invalid credentials or user not found');
          console.log('🔍 This could mean:');
          console.log('   - User doesn\'t exist in database');
          console.log('   - Password is incorrect');
          console.log('   - Password hashing mismatch');
          results.summary.failed++;
          results.summary.errors.push(`Login 401: Invalid credentials for ${testCase.data.email}`);
        } else if (result.statusCode === 500) {
          console.log('❌ Server error during login');
          results.summary.failed++;
          results.summary.errors.push(`Login server error: ${result.statusCode}`);
        } else {
          console.log(`❌ Unexpected login status: ${result.statusCode}`);
          results.summary.failed++;
          results.summary.errors.push(`Unexpected login status: ${result.statusCode}`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Test failed with exception: ${error.message}`);
      results.tests[testCase.name] = {
        description: testCase.description,
        success: false,
        error: error.message
      };
      results.summary.failed++;
      results.summary.errors.push(`${testCase.name}: ${error.message}`);
    }
    
    // Pausa tra i test per non sovraccaricare
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // SUMMARY FINALE
  console.log('\n' + '='.repeat(80));
  console.log('🎯 SUMMARY DIAGNOSTICO');
  console.log('='.repeat(80));
  console.log(`📊 Test eseguiti: ${results.summary.total}`);
  console.log(`✅ Test passati: ${results.summary.passed}`);  
  console.log(`❌ Test falliti: ${results.summary.failed}`);
  console.log(`📅 Eseguito il: ${results.timestamp}`);

  if (results.summary.errors.length > 0) {
    console.log('\n🔍 ERRORI RILEVATI:');
    results.summary.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  // RACCOMANDAZIONI
  console.log('\n🎯 RACCOMANDAZIONI:');
  console.log('─'.repeat(40));
  
  if (results.tests.connectivity && !results.tests.connectivity.success) {
    console.log('1. 🔧 Il backend non è raggiungibile:');
    console.log('   - Verifica che sia deployato su Netlify');
    console.log('   - Controlla i log di build su Netlify');
    console.log('   - Verifica l\'URL dell\'API');
  }
  
  if (results.tests.register_user && results.tests.register_user.statusCode === 500) {
    console.log('2. 🗄️ Problemi con il database:');
    console.log('   - Verifica la connessione a Supabase');
    console.log('   - Controlla le variabili d\'ambiente su Netlify');
    console.log('   - Verifica che DATABASE_URL sia configurato');
  }
  
  if (results.tests.test_login_debug && results.tests.test_login_debug.success &&
      results.tests.normal_login && !results.tests.normal_login.success) {
    console.log('3. 🔐 Problema con Passport Guards:');
    console.log('   - Il debug login funziona ma quello normale no');
    console.log('   - Controlla LocalStrategy e LocalAuthGuard');
    console.log('   - Potrebbe essere un problema di dependency injection');
  }
  
  if (results.tests.normal_login && results.tests.normal_login.statusCode === 401) {
    console.log('4. 👤 Problema credenziali utente:');
    console.log('   - L\'utente potrebbe non esistere nel database');
    console.log('   - La password potrebbe essere sbagliata');
    console.log('   - Prova a creare un nuovo utente tramite registrazione');
  }

  console.log('\n🔧 PROSSIMI PASSI:');
  console.log('─'.repeat(40));
  console.log('1. Controlla i log di Netlify Functions per errori dettagliati');
  console.log('2. Verifica le variabili d\'ambiente su Netlify');  
  console.log('3. Testa la connessione al database Supabase');
  console.log('4. Se il debug login funziona, il problema è nei Guards');
  console.log('5. Se tutto fallisce, ribuilda e rideploya il backend');

  // Salva i risultati in un file per riferimento
  try {
    const fs = require('fs');
    fs.writeFileSync(
      `debug-results-${Date.now()}.json`,
      JSON.stringify(results, null, 2)
    );
    console.log('\n💾 Risultati salvati in debug-results-*.json');
  } catch (saveError) {
    console.log('\n⚠️ Non è stato possibile salvare i risultati');
  }

  return results;
}

// Esegui la diagnostica
runDiagnostics().catch(error => {
  console.error('💥 FATAL ERROR:', error);
  process.exit(1);
});
