// API ottimizzata per Supabase pooler con retry logic
const { PrismaClient } = require('@prisma/client');

let prisma;
let isConnecting = false;

// Configurazione Prisma ultra-ottimizzata per Supabase pooler
function createOptimizedPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL }
    },
    log: ['error'],
    __internal: {
      engine: {
        connectTimeout: 15000,    // 15 secondi per connessione
        idleTimeout: 2000,        // 2 secondi idle
        maxConnections: 1,        // Una sola connessione
      }
    }
  });
}

// Connessione con retry logic
async function ensureConnection() {
  if (prisma && !isConnecting) {
    return prisma;
  }

  if (isConnecting) {
    // Aspetta che la connessione in corso finisca
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return prisma;
  }

  isConnecting = true;
  
  try {
    if (!prisma) {
      console.log('🔌 Creating new Prisma client...');
      prisma = createOptimizedPrismaClient();
    }

    console.log('🔗 Establishing connection...');
    await prisma.$connect();
    console.log('✅ Connection established');
    
    return prisma;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    prisma = null; // Reset per retry
    throw error;
  } finally {
    isConnecting = false;
  }
}

exports.handler = async (event, context) => {
  console.log('🚀 Optimized Pooler API called:', event.httpMethod, event.path);
  
  // Ottimizza per serverless
  context.callbackWaitsForEmptyEventLoop = false;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Path processing
  const originalPath = event.path;
  const functionPrefix = '/.netlify/functions/api-pooler';
  let transformedPath = originalPath;
  
  if (originalPath.startsWith(functionPrefix)) {
    transformedPath = originalPath.slice(functionPrefix.length) || '/';
  }

  console.log('🔄 Path:', originalPath, '->', transformedPath);

  try {
    // Stabilisci connessione con retry
    const client = await ensureConnection();
    
    // Route handling
    if (transformedPath === '/' || transformedPath === '') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'OK',
          message: 'Optimized Pooler API working',
          timestamp: new Date().toISOString(),
          service: 'finance-tracker-pooler-optimized'
        })
      };
    }
    
    if (transformedPath === '/health') {
      console.log('📊 Testing database query...');
      const start = Date.now();
      
      // Query con timeout specifico
      const result = await Promise.race([
        client.$queryRaw`SELECT current_timestamp as health_check, version() as db_version`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health query timeout after 8s')), 8000)
        )
      ]);
      
      const queryTime = Date.now() - start;
      console.log(`✅ Health check completed in ${queryTime}ms`);
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'healthy',
          database: 'connected',
          query_time_ms: queryTime,
          timestamp: new Date().toISOString(),
          db_info: result[0]
        })
      };
    }
    
    if (transformedPath.includes('/auth/login')) {
      if (event.httpMethod !== 'POST') {
        return {
          statusCode: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Method not allowed' })
        };
      }

      const body = JSON.parse(event.body || '{}');
      const { email, password } = body;

      console.log('🔍 Login attempt for:', email?.substring(0, 3) + '***');

      if (!email || !password) {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Email and password required' })
        };
      }

      // Query utente con timeout
      console.log('📊 Querying user from database...');
      const userQuery = Promise.race([
        client.user.findUnique({ where: { email } }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('User query timeout after 10s')), 10000)
        )
      ]);

      const user = await userQuery;

      if (!user) {
        console.log('❌ User not found:', email);
        return {
          statusCode: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      // Verifica password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('❌ Invalid password for:', email);
        return {
          statusCode: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid credentials' })
        };
      }

      console.log('✅ Login successful for:', email);
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        })
      };
    }

    // 404 for unknown routes
    return {
      statusCode: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Not found',
        path: transformedPath,
        available_endpoints: ['/', '/health', '/auth/login']
      })
    };

  } catch (error) {
    console.error('❌ General error:', error);
    
    // Reset connessione su errore
    prisma = null;
    
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        error_type: error.constructor.name,
        timestamp: new Date().toISOString()
      })
    };
  }
};
