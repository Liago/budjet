// Function di debug ultra-semplice
exports.handler = async (event, context) => {
  console.log('🔍 Debug function called');
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'OK',
        message: 'Debug function working',
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'undefined',
          DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
          JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing',
          NETLIFY: process.env.NETLIFY || 'undefined'
        },
        request: {
          method: event.httpMethod,
          path: event.path,
          headers: Object.keys(event.headers || {})
        }
      }, null, 2)
    };
  } catch (error) {
    console.error('❌ Error in debug function:', error);
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Debug function error',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
