#!/usr/bin/env node

const https = require('https');

const API_BASE = 'https://bud-jet-be.netlify.app/.netlify/functions/api';

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    
    console.log(`🌐 Testing: ${API_BASE + path}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'Accept': 'application/json',
        'User-Agent': 'Debug-Test/1.0'
      }
    };
    
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
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function debugTest() {
  console.log('🧪 DEBUGGING ENDPOINT ROUTING...\n');
  
  const tests = [
    { name: 'Root endpoint', path: '/' },
    { name: 'Simple endpoint', path: '/simple' },
    { name: 'Health endpoint', path: '/health' },
  ];
  
  for (const test of tests) {
    console.log(`${test.name}: ${test.path}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await makeRequest(test.path);
      console.log(`✅ Status: ${result.statusCode}`);
      console.log(`📦 Response:`, JSON.stringify(result.data, null, 2));
      
      if (result.statusCode === 200) {
        console.log(`🎉 ${test.name} SUCCESS!`);
      } else {
        console.log(`❌ ${test.name} FAILED`);
      }
      
    } catch (error) {
      console.log(`💥 ${test.name} ERROR:`, error.message);
    }
    
    console.log('');
  }
}

debugTest();
