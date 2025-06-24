const https = require('https');

console.log('🧪 Testing PRODUCTION login endpoint (with guards)...');
console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login');

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

const req = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login', options, (res) => {
  let data = '';
  
  console.log('📡 Response Status:', res.statusCode);
  console.log('📡 Response Headers:', res.headers);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📡 Response Body:', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('📊 Parsed Response:', JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n🎉 PRODUCTION LOGIN SUCCESS!');
        console.log('🔍 Access Token Preview:', jsonData.accessToken?.substring(0, 50) + '...');
        console.log('🔍 User Info:', {
          id: jsonData.user?.id,
          email: jsonData.user?.email,
          name: jsonData.user?.name
        });
        
        // Verify token structure
        const tokenParts = jsonData.accessToken?.split('.');
        if (tokenParts && tokenParts.length === 3) {
          console.log('✅ JWT Token has correct structure (header.payload.signature)');
          
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🔍 Token payload:', {
              email: payload.email,
              sub: payload.sub,
              iat: new Date(payload.iat * 1000).toISOString(),
              exp: new Date(payload.exp * 1000).toISOString()
            });
          } catch (decodeError) {
            console.log('⚠️ Could not decode token payload');
          }
        }
        
      } else if (res.statusCode === 401) {
        console.log('\n❌ UNAUTHORIZED - Check credentials or guards');
        console.log('Error:', jsonData.message);
      } else {
        console.log(`\n⚠️ HTTP ${res.statusCode}:`, jsonData.message || jsonData.error);
      }
    } catch (parseError) {
      console.log('📊 Raw response (not JSON):', data);
      if (res.statusCode === 404) {
        console.log('\n❌ 404 Not Found - Endpoint may not exist');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(testData);
req.end();

// Also test registration endpoint
console.log('\n' + '='.repeat(50));
console.log('🧪 Testing REGISTRATION endpoint...');

const regData = JSON.stringify({
  email: 'test-new-user@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User'
});

const regOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(regData)
  }
};

setTimeout(() => {
  console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/register');
  
  const regReq = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/register', regOptions, (res) => {
    let data = '';
    
    console.log('📡 Registration Status:', res.statusCode);
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📡 Registration Body:', data);
      
      try {
        const jsonData = JSON.parse(data);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ REGISTRATION SUCCESS!');
        } else if (jsonData.message?.includes('already exists')) {
          console.log('ℹ️ User already exists (expected)');
        } else {
          console.log('⚠️ Registration response:', jsonData.message);
        }
      } catch (e) {
        console.log('📊 Raw registration response:', data);
      }
    });
  });
  
  regReq.on('error', (error) => {
    console.error('❌ Registration error:', error.message);
  });
  
  regReq.write(regData);
  regReq.end();
}, 1000); // Wait 1 second between requests