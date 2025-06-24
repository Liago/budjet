const https = require('https');

console.log('🔧 DEBUG AUTH GUARDS - Comparing endpoints');

// Test data
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

// Test 1: test-login (NO guards - should work)
console.log('\n🧪 TEST 1: test-login (NO GUARDS)');
console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/test-login');

const req1 = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/test-login', options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📡 Status:', res.statusCode);
    
    try {
      const json = JSON.parse(data);
      if (json.success) {
        console.log('✅ test-login SUCCESS');
        console.log('🔍 Token preview:', json.data?.accessToken?.substring(0, 30) + '...');
      } else {
        console.log('❌ test-login FAILED:', json.message);
      }
    } catch (e) {
      console.log('📊 Raw response:', data);
    }
    
    // Test 2: login (WITH guards - currently failing)
    setTimeout(() => {
      console.log('\n🧪 TEST 2: login (WITH GUARDS)');
      console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login');
      
      const req2 = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login', options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          console.log('📡 Status:', res.statusCode);
          
          try {
            const json = JSON.parse(data);
            if (res.statusCode === 200) {
              console.log('✅ login SUCCESS');
              console.log('🔍 Token preview:', json.accessToken?.substring(0, 30) + '...');
            } else {
              console.log('❌ login FAILED:', json.message);
              console.log('🔍 Error details:', json);
            }
          } catch (e) {
            console.log('📊 Raw response:', data);
          }
          
          // Summary
          console.log('\n' + '='.repeat(50));
          console.log('📊 SUMMARY:');
          console.log('✅ test-login (no guards): Should work');
          console.log('❌ login (with guards): Check LocalStrategy injection');
          console.log('\n🔧 Next steps if login still fails:');
          console.log('1. Check Netlify logs for LocalStrategy errors');
          console.log('2. Verify AuthService injection in LocalStrategy');
          console.log('3. Check for circular dependency issues');
        });
      });
      
      req2.on('error', (error) => {
        console.error('❌ login request error:', error.message);
      });
      
      req2.write(testData);
      req2.end();
    }, 1000);
  });
});

req1.on('error', (error) => {
  console.error('❌ test-login request error:', error.message);
});

req1.write(testData);
req1.end();