// Netlify Function ultra-semplificata per test CORS
// Nessuna dipendenza esterna, solo JavaScript puro

exports.handler = async (event, context) => {
  console.log('🚀 Ultra-simple function called!');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Origin:', event.headers?.origin);
  
  // CORS headers - sempre presenti
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400'
  };
  
  // Handle OPTIONS preflight IMMEDIATAMENTE
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
  const functionPrefix = '/.netlify/functions/api';
  let transformedPath = originalPath;
  
  if (originalPath.startsWith(functionPrefix)) {
    transformedPath = originalPath.slice(functionPrefix.length) || '/';
  }
  
  console.log('🔄 Path:', originalPath, '->', transformedPath);
  
  // Simple responses
  let responseData;
  let statusCode = 200;
  
  if (transformedPath === '/' || transformedPath === '') {
    responseData = {
      status: 'OK',
      message: '✅ Ultra-Simple CORS Test Function Working!',
      timestamp: new Date().toISOString(),
      version: 'ultra-simple-v1',
      cors_test: 'enabled'
    };
  } else if (transformedPath === '/health') {
    responseData = {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      netlify_region: process.env.AWS_REGION || 'unknown',
      test_mode: 'ultra-simple'
    };
  } else if (transformedPath.includes('/auth/login')) {
    // Simula una risposta di login fallita ma con CORS corretto
    statusCode = 400;
    responseData = {
      error: 'Test mode - login disabled',
      message: 'This is just a CORS test. If you see this message instead of a CORS error, CORS is working!',
      path: transformedPath,
      method: event.httpMethod,
      timestamp: new Date().toISOString(),
      cors_working: true
    };
  } else {
    statusCode = 404;
    responseData = {
      error: 'Endpoint not found',
      path: transformedPath,
      method: event.httpMethod,
      timestamp: new Date().toISOString(),
      available_endpoints: [
        'GET /',
        'GET /health', 
        'POST /auth/login (test mode)'
      ]
    };
  }
  
  // Override origin se specifico
  if (event.headers?.origin) {
    corsHeaders['Access-Control-Allow-Origin'] = event.headers.origin;
  }
  
  const response = {
    statusCode: statusCode,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(responseData, null, 2)
  };
  
  console.log('📤 Sending response:', {
    statusCode: response.statusCode,
    hasCorHeaders: !!response.headers['Access-Control-Allow-Origin'],
    bodyLength: response.body.length
  });
  
  return response;
};
