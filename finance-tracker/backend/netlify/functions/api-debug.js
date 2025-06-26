const { Handler } = require("@netlify/functions");

/**
 * 🔧 DEBUG API FUNCTION
 * Versione semplificata per diagnosticare problemi di base
 */

exports.handler = async (event, context) => {
  console.log("🔄 Debug API Function Called");
  
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-requested-with, Accept, Origin",
    "Content-Type": "application/json"
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "CORS OK" })
    };
  }

  try {
    // Log environment
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET',
      LAMBDA_TASK_ROOT: process.env.LAMBDA_TASK_ROOT,
      AWS_REGION: process.env.AWS_REGION
    };

    console.log("🔧 Environment:", envInfo);

    // Simple health check
    if (event.path === "/api/health" || event.path === "/health") {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: "OK",
          timestamp: new Date().toISOString(),
          environment: envInfo,
          path: event.path,
          method: event.httpMethod
        })
      };
    }

    // Simple login endpoint test
    if (event.path === "/api/auth/login" || event.path === "/auth/login") {
      const body = event.body ? JSON.parse(event.body) : {};
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Login endpoint reached",
          receivedBody: body,
          timestamp: new Date().toISOString(),
          note: "This is a debug version - not real authentication"
        })
      };
    }

    // Default response
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Not Found",
        availableEndpoints: ["/health", "/auth/login"],
        receivedPath: event.path,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error("❌ Debug API Error:", error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal Server Error",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 