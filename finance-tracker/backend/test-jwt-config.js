// test-jwt-config.js - Script per testare la configurazione JWT
console.log('🔧 JWT Configuration Test - Starting...');

// Test environment variables
console.log('\n📝 Environment Variables:');
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 JWT_SECRET available:', !!process.env.JWT_SECRET);
console.log('🔍 JWT_SECRET length:', process.env.JWT_SECRET?.length);
console.log('🔍 JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);

// Test JWT functionality
console.log('\n🧪 Testing JWT functionality...');

try {
  // Import JWT library
  const jwt = require('jsonwebtoken');
  console.log('✅ jsonwebtoken library imported successfully');
  
  // Test payload
  const testPayload = {
    email: 'test@example.com',
    sub: 1,
    iat: Math.floor(Date.now() / 1000)
  };
  
  // Test signing
  const secret = process.env.JWT_SECRET || 'fallback-jwt-secret-for-development-minimum-32-chars';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  console.log('🔍 Using secret length:', secret.length);
  console.log('🔍 Using expires in:', expiresIn);
  
  const token = jwt.sign(testPayload, secret, { expiresIn });
  console.log('✅ JWT token signed successfully');
  console.log('🔍 Token length:', token.length);
  console.log('🔍 Token preview:', token.substring(0, 50) + '...');
  
  // Test verification
  const decoded = jwt.verify(token, secret);
  console.log('✅ JWT token verified successfully');
  console.log('🔍 Decoded payload:', decoded);
  
  console.log('\n🎉 JWT Configuration Test: ALL PASSED! ✅');
  
} catch (error) {
  console.error('\n❌ JWT Configuration Test FAILED:');
  console.error('🔍 Error message:', error.message);
  console.error('🔍 Error stack:', error.stack);
  
  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Check if JWT_SECRET is set correctly');
  console.log('2. Verify jsonwebtoken package is installed');
  console.log('3. Check if secret meets minimum length requirements');
}