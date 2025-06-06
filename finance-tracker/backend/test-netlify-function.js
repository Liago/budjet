// test-netlify-function.js
// Script per testare la function Netlify localmente

const { handler } = require('./netlify/functions/api');

async function testFunction() {
  console.log('🧪 Testing Netlify function...');
  
  // Test 1: Base endpoint
  console.log('\n📍 Test 1: Base endpoint');
  try {
    const baseEvent = {
      httpMethod: 'GET',
      path: '/.netlify/functions/api',
      headers: {
        'Content-Type': 'application/json',
      },
      body: null,
      queryStringParameters: null,
    };
    
    const baseResult = await handler(baseEvent, {});
    console.log('✅ Base endpoint result:', {
      statusCode: baseResult.statusCode,
      body: baseResult.body ? JSON.parse(baseResult.body) : null
    });
  } catch (error) {
    console.error('❌ Base endpoint error:', error.message);
  }
  
  // Test 2: Health check
  console.log('\n📍 Test 2: Health check');
  try {
    const healthEvent = {
      httpMethod: 'GET',
      path: '/.netlify/functions/api/health',
      headers: {
        'Content-Type': 'application/json',
      },
      body: null,
      queryStringParameters: null,
    };
    
    const healthResult = await handler(healthEvent, {});
    console.log('✅ Health check result:', {
      statusCode: healthResult.statusCode,
      body: healthResult.body ? JSON.parse(healthResult.body) : null
    });
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }
  
  // Test 3: OPTIONS preflight
  console.log('\n📍 Test 3: OPTIONS preflight');
  try {
    const optionsEvent = {
      httpMethod: 'OPTIONS',
      path: '/.netlify/functions/api/auth/login',
      headers: {
        'Origin': 'https://bud-jet.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      },
      body: null,
      queryStringParameters: null,
    };
    
    const optionsResult = await handler(optionsEvent, {});
    console.log('✅ OPTIONS result:', {
      statusCode: optionsResult.statusCode,
      headers: optionsResult.headers
    });
  } catch (error) {
    console.error('❌ OPTIONS error:', error.message);
  }
  
  // Test 4: Auth login (this should fail without credentials)
  console.log('\n📍 Test 4: Auth login');
  try {
    const loginEvent = {
      httpMethod: 'POST',
      path: '/.netlify/functions/api/auth/login',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      }),
      queryStringParameters: null,
    };
    
    const loginResult = await handler(loginEvent, {});
    console.log('Auth login result:', {
      statusCode: loginResult.statusCode,
      headers: Object.keys(loginResult.headers || {}),
      body: loginResult.body ? JSON.parse(loginResult.body) : null
    });
  } catch (error) {
    console.error('❌ Auth login error:', error.message);
  }
}

// Set environment variables for testing
process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = 'postgresql://postgres.cmwfwxrqbpjamqzuhpxy:ua4dpMvaXKdwYjjU@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
process.env.JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long-for-testing';
process.env.NETLIFY = 'true';

testFunction().catch(console.error);
