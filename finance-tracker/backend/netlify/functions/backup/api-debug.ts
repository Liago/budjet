import { Handler } from '@netlify/functions';

// CORS headers configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, Accept, Origin, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

export const handler: Handler = async (event, context) => {
  console.log('🚀 API Function called!');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Origin:', event.headers?.origin);
  
  // Optimize Netlify function context
  context.callbackWaitsForEmptyEventLoop = false;
  
  // **PRIORITÀ ASSOLUTA: Gestisci OPTIONS preflight IMMEDIATAMENTE**
  if (event.httpMethod === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight request');
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }
  
  try {
    // Enhanced path transformation
    const originalPath = event.path;
    const functionPrefix = '/.netlify/functions/api';
    
    let transformedPath = originalPath;
    if (originalPath.startsWith(functionPrefix)) {
      transformedPath = originalPath.slice(functionPrefix.length) || '/';
    }
    
    console.log('🔄 Path transformation:', {
      original: originalPath,
      transformed: transformedPath
    });
    
    // Simple routing for debug
    let responseBody;
    let statusCode = 200;
    
    if (transformedPath === '/' || transformedPath === '') {
      responseBody = {
        status: 'OK',
        message: 'Bud-Jet Backend API is running (Simple Mode)',
        timestamp: new Date().toISOString(),
        service: 'finance-tracker-backend',
        version: '1.0.0-debug',
        mode: 'simplified-for-debug'
      };
    } else if (transformedPath === '/health') {
      responseBody = {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        checks: {
          server: 'up',
          database: 'skipped-in-debug-mode',
          email: process.env.SMTP_HOST ? 'configured' : 'disabled'
        },
        netlify: {
          region: process.env.AWS_REGION || 'unknown',
          requestId: process.env.AWS_REQUEST_ID || 'local'
        }
      };
    } else if (transformedPath.startsWith('/auth/login')) {
      statusCode = 501; // Not implemented in debug mode
      responseBody = {
        error: 'Not implemented in debug mode',
        message: 'This is a simplified function for debugging CORS. Auth endpoints are disabled.',
        path: transformedPath,
        method: event.httpMethod,
        timestamp: new Date().toISOString(),
        suggestion: 'Use the full NestJS function once CORS is working'
      };
    } else {
      statusCode = 404;
      responseBody = {
        error: 'Endpoint not found',
        path: transformedPath,
        method: event.httpMethod,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
          'GET /',
          'GET /health',
          'POST /auth/login (disabled in debug mode)'
        ]
      };
    }
    
    const result = {
      statusCode,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responseBody, null, 2)
    };
    
    // Override origin specifico se fornito
    if (event.headers?.origin) {
      result.headers['Access-Control-Allow-Origin'] = event.headers.origin;
    }
    
    console.log('📤 Response:', {
      statusCode: result.statusCode,
      corsHeaders: !!result.headers['Access-Control-Allow-Origin'],
      bodyLength: result.body.length
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.headers?.origin || '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: event.path,
        method: event.httpMethod
      })
    };
  }
};
