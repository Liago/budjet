#!/usr/bin/env node

// find-netlify-url.js - Script per trovare URL Netlify e testare auth

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for Netlify URL...');

// 1. Controlla i file di configurazione
const configFiles = [
  '.env.production',
  '.env',
  'netlify.toml',
  'package.json'
];

let netlifyUrl = null;

for (const file of configFiles) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Cerca pattern di URL Netlify
    const urlPatterns = [
      /https:\/\/([a-z0-9-]+)\.netlify\.app/gi,
      /CORS_ORIGIN[="']+(https:\/\/[^"']+)/gi,
      /url[="']+(https:\/\/[^"']+netlify[^"']*)/gi
    ];
    
    for (const pattern of urlPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`✅ Found URL in ${file}:`, matches[0]);
        netlifyUrl = matches[0].replace(/CORS_ORIGIN[="']+/, '').replace(/url[="']+/, '');
        break;
      }
    }
    
    if (netlifyUrl) break;
  }
}

// 2. Se non trovato, prova a cercare nei log di git
if (!netlifyUrl) {
  console.log('🔍 Checking git remotes...');
  try {
    const { execSync } = require('child_process');
    const gitRemote = execSync('git remote -v', { encoding: 'utf8' });
    console.log('Git remotes:', gitRemote);
  } catch (error) {
    console.log('No git info available');
  }
}

// 3. URL predefiniti comuni per questo progetto
const commonUrls = [
  'https://bud-jet-be.netlify.app',
  'https://bud-jet.netlify.app',
  'https://finance-tracker-backend.netlify.app'
];

if (!netlifyUrl) {
  console.log('🔍 Trying common URLs...');
  netlifyUrl = commonUrls[0]; // Default
}

console.log('🎯 Using Netlify URL:', netlifyUrl);

// 4. Funzione per testare l'endpoint
async function testAuthEndpoint(baseUrl) {
  const url = `${baseUrl}/.netlify/functions/api/auth/test-login`;
  
  console.log('\n🧪 Testing auth endpoint:', url);
  
  const testData = JSON.stringify({
    email: 'debug@test.com',
    password: 'YourPassword123!'
  });
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      console.log('📡 Response status:', res.statusCode);
      console.log('📡 Response headers:', res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 Response body:', data);
        
        try {
          const jsonData = JSON.parse(data);
          console.log('📊 Parsed response:', JSON.stringify(jsonData, null, 2));
          resolve({ status: res.statusCode, data: jsonData });
        } catch (parseError) {
          console.log('📊 Raw response (not JSON):', data);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      reject(error);
    });
    
    req.write(testData);
    req.end();
  });
}

// 5. Test principale
async function main() {
  try {
    console.log('\n🚀 Starting authentication test...');
    
    const result = await testAuthEndpoint(netlifyUrl);
    
    if (result.status === 200) {
      console.log('\n✅ SUCCESS: Authentication working!');
      if (result.data.success) {
        console.log('🎉 JWT Token generated successfully!');
        console.log('🔍 Token preview:', result.data.data?.accessToken?.substring(0, 50) + '...');
      }
    } else if (result.status === 404) {
      console.log('\n❌ 404 Not Found - Check if URL is correct');
      console.log('💡 Try these URLs manually:');
      commonUrls.forEach(url => {
        console.log(`   ${url}/.netlify/functions/api/auth/test-login`);
      });
    } else {
      console.log(`\n⚠️  Status ${result.status} - Check server logs`);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    console.log('\n🔧 Manual test commands:');
    commonUrls.forEach(url => {
      console.log(`\ncurl -X POST ${url}/.netlify/functions/api/auth/test-login \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '{"email":"debug@test.com","password":"YourPassword123!"}'`);
    });
  }
}

// 6. Genera anche comandi curl
console.log('\n📋 Manual curl commands:');
if (netlifyUrl) {
  console.log(`\ncurl -X POST ${netlifyUrl}/.netlify/functions/api/auth/test-login \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"email":"debug@test.com","password":"YourPassword123!"}'`);
}

main();