// Test connessione database ultra-semplificato
const { PrismaClient } = require('@prisma/client');

exports.handler = async (event, context) => {
  console.log('🔍 Testing database connection...');
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // Test 1: Verifica DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    console.log('📋 DATABASE_URL exists:', !!dbUrl);
    console.log('📋 DATABASE_URL preview:', dbUrl ? dbUrl.substring(0, 30) + '...' : 'MISSING');

    // Test 2: Crea client Prisma con timeout ridotto
    console.log('🔌 Creating Prisma client...');
    const prisma = new PrismaClient({
      datasources: {
        db: { url: dbUrl }
      },
      log: ['error', 'warn'],
      __internal: {
        engine: {
          connectTimeout: 5000,  // 5 seconds timeout
          idleTimeout: 5000
        }
      }
    });

    // Test 3: Connessione semplice
    console.log('🔗 Attempting to connect...');
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 5s')), 5000)
      )
    ]);
    
    console.log('✅ Connected successfully');

    // Test 4: Query semplissima
    console.log('📊 Testing simple query...');
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 3s')), 3000)
      )
    ]);
    
    console.log('✅ Query successful:', result);

    await prisma.$disconnect();

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'SUCCESS',
        message: 'Database connection working',
        test_result: result,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('❌ Error stack:', error.stack);

    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'FAILED',
        error: error.message,
        error_type: error.constructor.name,
        timestamp: new Date().toISOString(),
        database_url_configured: !!process.env.DATABASE_URL
      })
    };
  }
};
