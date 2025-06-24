const https = require('https');

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

console.log('🧪 Testing auth endpoint...');
console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/test-login');

const req = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/test-login', options, (res) => {
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
        if (jsonData.success) {
          console.log('\n🎉 SUCCESS! JWT Authentication is working!');
          console.log('🔍 Access Token Preview:', jsonData.data?.accessToken?.substring(0, 50) + '...');
          console.log('🔍 User Info:', {
            id: jsonData.data?.user?.id,
            email: jsonData.data?.user?.email,
            name: jsonData.data?.user?.name
          });
        } else {
          console.log('\n⚠️ Response 200 but not success:');
          console.log('Message:', jsonData.message);
          console.log('Step:', jsonData.step);
        }
      } else {
        console.log(`\n❌ HTTP ${res.statusCode}:`, jsonData.message || jsonData.error);
      }
    } catch (parseError) {
      console.log('📊 Raw response (not JSON):', data);
      if (res.statusCode === 404) {
        console.log('\n❌ 404 Not Found - Check if endpoint URL is correct');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.error('🔧 Possible causes:');
  console.error('  - Network connectivity issues');
  console.error('  - Netlify function not deployed');
  console.error('  - Incorrect URL');
});

req.write(testData);
req.end();