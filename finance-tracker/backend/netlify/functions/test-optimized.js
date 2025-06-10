// Test connessione ottimizzato per serverless
const { PrismaClient } = require('@prisma/client');

let prisma;

// Configurazione Prisma ottimizzata per serverless/Netlify
function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL }
    },
    log: ['error'],
    __internal: {
      engine: {
        connectTimeout: 8000,     // 8 secondi per connessione  
        idleTimeout: 1000,        // 1 secondo idle (serverless)
        maxConnections: 1,        // Una sola connessione per function
      }
    }
  });
}

exports.handler = async (event, context) => {
  console.log('🔍 Testing optimized database connection...');
  
  // Ottimizza per serverless
  context.callbackWaitsForEmptyEventLoop = false;
  
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
    // Test 1: Verifica URL
    const dbUrl = process.env.DATABASE_URL;
    console.log('📋 DATABASE_URL preview:', dbUrl ? dbUrl.substring(0, 40) + '...' : 'MISSING');
    
    // Identifica tipo di connessione
    const isPooler = dbUrl && dbUrl.includes('pooler');
    const isDirect = dbUrl && dbUrl.includes('db.') && dbUrl.includes(':5432');
    
    console.log('🔌 Connection type:', {
      pooler: isPooler,
      direct: isDirect,
      port: dbUrl && dbUrl.includes(':6543') ? '6543 (pooler)' : '5432 (direct)'
    });

    // Test 2: Crea client con config ottimizzata
    console.log('🔌 Creating optimized Prisma client...');
    if (!prisma) {
      prisma = createPrismaClient();
    }

    // Test 3: Connessione con timeout lungo
    console.log('🔗 Attempting to connect (8s timeout)...');
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 8s')), 8000)
      )
    ]);
    
    console.log('✅ Connected successfully');

    // Test 4: Query veloce
    console.log('📊 Testing minimal query...');
    const start = Date.now();
    
    const result = await Promise.race([
      prisma.$queryRaw`SELECT current_timestamp as test_time`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 5s')), 5000)
      )
    ]);
    
    const queryTime = Date.now() - start;
    console.log(`✅ Query successful in ${queryTime}ms:`, result);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'SUCCESS',
        message: 'Optimized database connection working',
        connection_type: isPooler ? 'pooler' : isDirect ? 'direct' : 'unknown',
        query_time_ms: queryTime,
        result: result,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('❌ Optimized test failed:', error.message);

    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'FAILED',
        error: error.message,
        error_type: error.constructor.name,
        connection_info: {
          url_configured: !!process.env.DATABASE_URL,
          is_pooler: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('pooler'),
          is_direct: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('db.') && process.env.DATABASE_URL.includes(':5432')
        },
        timestamp: new Date().toISOString()
      })
    };
  }
};
