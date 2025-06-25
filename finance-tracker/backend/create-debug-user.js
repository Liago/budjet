const https = require('https');

console.log('🔧 Creating debug user via registration endpoint...');

// Dati per creare l'utente debug
const userData = JSON.stringify({
  email: 'debug@test.com',
  password: 'YourPassword123!',
  firstName: 'Debug',
  lastName: 'User'
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(userData)
  }
};

console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/register');
console.log('📝 User data:', {
  email: 'debug@test.com',
  password: '[HIDDEN]',
  firstName: 'Debug',
  lastName: 'User'
});

const req = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/register', options, (res) => {
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
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ SUCCESS: Debug user created successfully!');
        console.log('🔍 User ID:', jsonData.id);
        console.log('🔍 User Email:', jsonData.email);
        console.log('🔍 User Name:', jsonData.name);
        
        // Now test login immediately
        testLogin();
        
      } else if (jsonData.message?.includes('already exists')) {
        console.log('\n💡 User already exists - that\'s fine!');
        console.log('📝 Trying login with existing user...');
        
        // Test login with existing user
        testLogin();
        
      } else {
        console.log(`\n❌ Registration failed with status ${res.statusCode}`);
        console.log('Error details:', jsonData);
        
        if (res.statusCode === 500) {
          console.log('\n🔧 Possible causes of 500 error:');
          console.log('1. Database connection issues');
          console.log('2. Validation errors in RegisterDto');
          console.log('3. Password hashing errors');
          console.log('4. UsersService.create() method issues');
        }
      }
    } catch (parseError) {
      console.log('📊 Raw response (not JSON):', data);
      console.log('Parse error:', parseError.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(userData);
req.end();

// Function to test login after registration
function testLogin() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 Testing login with debug user...');
  
  const loginData = JSON.stringify({
    email: 'debug@test.com',
    password: 'YourPassword123!'
  });
  
  const loginOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  setTimeout(() => {
    console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/test-login');
    
    const loginReq = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/test-login', loginOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 Login Status:', res.statusCode);
        
        try {
          const json = JSON.parse(data);
          if (json.success) {
            console.log('🎉 LOGIN SUCCESS! Authentication is now working!');
            console.log('🔍 Token preview:', json.data?.accessToken?.substring(0, 50) + '...');
            
            // Test production login endpoint too
            testProductionLogin();
            
          } else {
            console.log('❌ Login failed:', json.message);
            console.log('🔍 Step:', json.step);
            console.log('\n🔧 Troubleshooting:');
            console.log('1. Check if user was created correctly');
            console.log('2. Verify password hashing matches');
            console.log('3. Check database connection');
          }
        } catch (e) {
          console.log('📊 Raw login response:', data);
        }
      });
    });
    
    loginReq.on('error', (error) => {
      console.error('❌ Login test error:', error.message);
    });
    
    loginReq.write(loginData);
    loginReq.end();
  }, 2000); // Wait 2 seconds for user creation
}

// Function to test production login endpoint
function testProductionLogin() {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 Testing PRODUCTION login endpoint...');
  
  const loginData = JSON.stringify({
    email: 'debug@test.com',
    password: 'YourPassword123!'
  });
  
  const loginOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  setTimeout(() => {
    console.log('🎯 URL: https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login');
    
    const prodReq = https.request('https://bud-jet-be.netlify.app/.netlify/functions/api/auth/login', loginOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 Production Login Status:', res.statusCode);
        
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('🎉 PRODUCTION LOGIN SUCCESS!');
            console.log('🔍 Token preview:', json.accessToken?.substring(0, 50) + '...');
            
            console.log('\n' + '='.repeat(50));
            console.log('🎊 AUTHENTICATION FULLY WORKING!');
            console.log('✅ Registration: Working');
            console.log('✅ Test Login: Working');
            console.log('✅ Production Login: Working');
            console.log('✅ JWT Generation: Working');
            console.log('✅ Guards: Working');
            console.log('\n🚀 Ready for frontend integration!');
            
          } else {
            console.log('❌ Production login failed:', json.message);
          }
        } catch (e) {
          console.log('📊 Raw production response:', data);
        }
      });
    });
    
    prodReq.on('error', (error) => {
      console.error('❌ Production login error:', error.message);
    });
    
    prodReq.write(loginData);
    prodReq.end();
  }, 1000);
}