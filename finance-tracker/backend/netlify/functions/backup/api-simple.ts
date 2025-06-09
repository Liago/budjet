import { Handler } from '@netlify/functions';

// Simplified API function
export const handler: Handler = async (event, context) => {
  console.log('API function called:', event.httpMethod, event.path);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://bud-jet.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }
  
  // Basic routing
  const path = event.path.replace('/.netlify/functions/api-simple', '') || '/';
  
  let response;
  
  if (path === '/' || path === '') {
    response = {
      message: 'Finance Tracker API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /' ,
        'POST /auth/login',
        'GET /health'
      ]
    };
  } else if (path === '/health') {
    response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'not connected yet'
    };
  } else {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://bud-jet.netlify.app'
      },
      body: JSON.stringify({
        error: 'Endpoint not found',
        path: path,
        message: 'This endpoint is not implemented in the simplified version'
      })
    };
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://bud-jet.netlify.app',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    body: JSON.stringify(response)
  };
};
