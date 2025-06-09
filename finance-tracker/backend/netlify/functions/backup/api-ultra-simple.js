// Netlify Function ultra-semplificata per test CORS
// Versione 2 con debug specifico per POST requests

exports.handler = async (event, context) => {
  console.log('🚀 Ultra-simple function called!');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Origin:', event.headers?.origin);
  console.log('Headers received:', JSON.stringify(event.headers, null, 2));
  
  // CORS headers - MOLTO permissivi per il debug
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, Accept, Origin, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
  };
  
  // **PRIORITÀ ASSOLUTA**: Gestisci OPTIONS preflight per QUALSIASI path
  if (event.httpMethod === 'OPTIONS') {
    console.log('🔄 OPTIONS preflight detected!');
    console.log('Request headers:', event.headers['access-control-request-headers']);
    console.log('Request method:', event.headers['access-control-request-method']);
    
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
  
  console.log('🔄 Path transformation:', {
    original: originalPath,
    transformed: transformedPath,
    method: event.httpMethod
  });
  
  // Simple responses con logging dettagliato
  let responseData;
  let statusCode = 200;
  
  if (transformedPath === '/' || transformedPath === '') {
    console.log('📍 Serving root endpoint');
    responseData = {
      status: 'OK',
      message: '✅ Ultra-Simple CORS Test Function Working!',
      timestamp: new Date().toISOString(),
      version: 'ultra-simple-v2',
      cors_test: 'enabled',
      method_received: event.httpMethod
    };
  } else if (transformedPath === '/health') {
    console.log('📍 Serving health endpoint');
    responseData = {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      netlify_region: process.env.AWS_REGION || 'unknown',
      test_mode: 'ultra-simple',
      method_received: event.httpMethod
    };
  } else if (transformedPath.includes('/auth/login') || transformedPath === '/auth/login') {
    console.log('📍 Serving auth/login endpoint');
    console.log('📍 Method:', event.httpMethod);
    console.log('📍 Body:', event.body);
    
    // Risposta specifica per login che indica che CORS funziona
    statusCode = 200; // Cambiamo a 200 per evitare che il browser interpreti come errore
    responseData = {
      cors_test_result: 'SUCCESS',
      message: '🎉 CORS is working! This endpoint received your request without CORS errors.',
      details: {
        path: transformedPath,
        method: event.httpMethod,
        timestamp: new Date().toISOString(),
        origin: event.headers?.origin || 'no-origin',
        body_received: !!event.body,
        test_status: 'cors-working'
      },
      next_step: 'CORS is confirmed working. You can now restore the full NestJS function.'
    };
  } else {
    console.log('📍 Unknown endpoint:', transformedPath);
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
    console.log('🔄 Set specific origin:', event.headers.origin);
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
    corsOrigin: response.headers['Access-Control-Allow-Origin'],
    bodyLength: response.body.length,
    allHeaders: Object.keys(response.headers)
  });
  
  return response;
};
