import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  console.log('🚀 Simple test function called!');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  
  // Handle CORS for all requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
  };
  
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('🔄 Handling OPTIONS preflight');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  // Simple response
  return {
    statusCode: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: '✅ Simple test function works!',
      method: event.httpMethod,
      path: event.path,
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
        JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing'
      }
    })
  };
};
