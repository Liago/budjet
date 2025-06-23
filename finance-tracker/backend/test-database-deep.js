#!/usr/bin/env node

const https = require('https');

async function testDatabaseDirect() {
  console.log('🔍 TESTING DATABASE CONNECTION DIRECTLY...');
  console.log('============================================\n');
  
  // Test 1: Health endpoint con database test
  console.log('1️⃣ Testing Database via Health Endpoint...');
  console.log('─'.repeat(50));
  
  try {
    const url = new URL('https://bud-jet-be.netlify.app/.netlify/functions/api/health');
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://bud-jet.netlify.app',
        'Accept': 'application/json',
        'User-Agent': 'DB-Test/1.0'
      }
    };
    
    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              data: JSON.parse(responseData)
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              data: responseData
            });
          }
        });
      });
      
      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });
      req.end();
    });
    
    console.log(`📊 Status: ${result.statusCode}`);
    console.log(`📦 Response:`, JSON.stringify(result.data, null, 2));
    
    if (result.data.debug) {
      console.log('\n🔍 DATABASE DEBUG INFO:');
      console.log('─'.repeat(30));
      console.log('📦 PrismaService Injected:', result.data.debug.prismaInjected);
      console.log('📦 Prisma Type:', result.data.debug.prismaType);
      console.log('📦 Has Database URL:', result.data.debug.hasDatabaseUrl);
      console.log('📦 Database URL Prefix:', result.data.debug.databaseUrlPrefix);
      console.log('📦 Database Status:', result.data.checks.database);
      console.log('📦 Database Error:', result.data.checks.databaseError);
      
      if (result.data.debug.databaseTest) {
        console.log('\n🔬 DATABASE TEST DETAILS:');
        console.log('─'.repeat(30));
        console.log('📦 Connected:', result.data.debug.databaseTest.connected);
        console.log('📦 Error:', result.data.debug.databaseTest.error);
        console.log('📦 Latency:', result.data.debug.databaseTest.latency, 'ms');
        console.log('📦 Provider:', result.data.debug.databaseTest.provider);
      }
    }
    
    // Analisi del problema
    console.log('\n🎯 ANALYSIS:');
    console.log('─'.repeat(20));
    
    if (result.data.debug?.prismaInjected) {
      console.log('✅ Dependency injection: WORKING');
    } else {
      console.log('❌ Dependency injection: FAILED');
    }
    
    if (result.data.debug?.hasDatabaseUrl) {
      console.log('✅ Database URL: CONFIGURED');
    } else {
      console.log('❌ Database URL: MISSING');
    }
    
    if (result.data.checks?.database === 'connected') {
      console.log('✅ Database connection: WORKING');
      console.log('🎉 DATABASE IS FULLY FUNCTIONAL!');
    } else {
      console.log('❌ Database connection: FAILED');
      console.log('🔍 Error:', result.data.checks?.databaseError || 'Unknown error');
      
      // Suggestions based on error type
      const error = result.data.checks?.databaseError || '';
      
      if (error.includes('timeout')) {
        console.log('\n💡 SUGGESTED FIXES:');
        console.log('  - Increase timeout values further');
        console.log('  - Check Supabase region/latency');
        console.log('  - Verify database is not paused');
      } else if (error.includes('authentication') || error.includes('password')) {
        console.log('\n💡 SUGGESTED FIXES:');
        console.log('  - Verify Supabase credentials');
        console.log('  - Check database URL format');
        console.log('  - Ensure database user has permissions');
      } else if (error.includes('connection')) {
        console.log('\n💡 SUGGESTED FIXES:');
        console.log('  - Check Supabase status');
        console.log('  - Verify network connectivity');
        console.log('  - Try different connection string');
      } else {
        console.log('\n💡 SUGGESTED FIXES:');
        console.log('  - Check Netlify Function logs for details');
        console.log('  - Verify all environment variables');
        console.log('  - Test Supabase connectivity externally');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testDatabaseDirect();
