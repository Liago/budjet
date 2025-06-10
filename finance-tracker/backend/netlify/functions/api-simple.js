// API semplificata per test Prisma senza NestJS
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, Accept, Origin, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

let prisma;

async function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      errorFormat: 'minimal',
      log: ['error']
    });
  }
  return prisma;
}

exports.handler = async (event, context) => {
  console.log('🚀 API Simple called:', event.httpMethod, event.path);
  
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
  const functionPrefix = '/.netlify/functions/api-simple';
  let transformedPath = originalPath;
  
  if (originalPath.startsWith(functionPrefix)) {
    transformedPath = originalPath.slice(functionPrefix.length) || '/';
  }

  console.log('🔄 Path:', originalPath, '->', transformedPath);

  try {
    const client = await getPrismaClient();
    
    // Route handling
    if (transformedPath === '/' || transformedPath === '') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'OK',
          message: 'API Simple (without NestJS) working',
          timestamp: new Date().toISOString(),
          service: 'finance-tracker-simple-api'
        })
      };
    }
    
    if (transformedPath === '/health') {
      // Test database connection
      try {
        await client.$connect();
        const result = await client.$queryRaw`SELECT 1 as test`;
        
        return {
          statusCode: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            test_query: result
          })
        };
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'unhealthy',
            database: 'error',
            error: dbError.message,
            timestamp: new Date().toISOString()
          })
        };
      }
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

      // Find user in database
      try {
        await client.$connect();
        const user = await client.user.findUnique({
          where: { email }
        });

        if (!user) {
          console.log('❌ User not found:', email);
          return {
            statusCode: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Invalid credentials' })
          };
        }

        // Verify password
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
        
        // Simple success response (without JWT for now)
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

      } catch (dbError) {
        console.error('❌ Database error during login:', dbError);
        return {
          statusCode: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Database error',
            message: dbError.message
          })
        };
      }
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
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
