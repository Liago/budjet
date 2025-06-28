const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * 🔧 LOGIN DEBUG FUNCTION - ENHANCED CORS VERSION
 * Gestione completa CORS con debugging avanzato
 */

// CORS headers - Configurazione robusta per tutti i browser
const getCorsHeaders = (origin) => {
  const allowedOrigins = [
    'https://bud-jet.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ];
  
  const isAllowed = !origin || allowedOrigins.includes(origin) || origin.includes('netlify.app');
  const allowOrigin = isAllowed ? (origin || '*') : 'https://bud-jet.netlify.app';
  
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, X-Requested-With, Origin",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Content-Type": "application/json",
    "Vary": "Origin"
  };
};

exports.handler = async (event, context) => {
  console.log('🔧 LOGIN-DEBUG: Start processing request');
  console.log('🔧 Method:', event.httpMethod);
  console.log('🔧 Origin:', event.headers?.origin || 'No origin');
  console.log('🔧 Headers:', JSON.stringify(event.headers, null, 2));

  // Get CORS headers based on origin
  const corsHeaders = getCorsHeaders(event.headers?.origin);
  
  console.log('🔧 CORS Headers:', JSON.stringify(corsHeaders, null, 2));

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    console.log('🔧 Handling OPTIONS preflight request');
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: "CORS preflight OK",
        timestamp: new Date().toISOString(),
        allowedMethods: ["GET", "POST", "OPTIONS"],
        debug: "Preflight handled successfully"
      })
    };
  }

  // Only allow POST for actual login
  if (event.httpMethod !== "POST") {
    console.log('🔧 Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: "Method not allowed",
        allowedMethods: ["POST", "OPTIONS"],
        received: event.httpMethod
      })
    };
  }

  const prisma = new PrismaClient();
  const debugSteps = [];

  try {
    console.log('🔧 DEBUG LOGIN - Step by step analysis');
    
    // Step 1: Parse body
    let body;
    try {
      body = JSON.parse(event.body || '{}');
      debugSteps.push({ step: 1, action: "Parse body", success: true, data: { email: body.email, hasPassword: !!body.password } });
      console.log('✅ Step 1: Body parsed successfully');
    } catch (e) {
      debugSteps.push({ step: 1, action: "Parse body", success: false, error: e.message });
      console.log('❌ Step 1: Body parse failed:', e.message);
      throw new Error('Invalid JSON body');
    }

    const { email, password } = body;

    // Step 2: Validate input
    if (!email || !password) {
      debugSteps.push({ step: 2, action: "Validate input", success: false, error: "Missing email or password" });
      console.log('❌ Step 2: Input validation failed');
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ debugSteps, error: "Email and password required" })
      };
    }
    debugSteps.push({ step: 2, action: "Validate input", success: true });
    console.log('✅ Step 2: Input validated');

    // Step 3: Connect to database
    await prisma.$connect();
    debugSteps.push({ step: 3, action: "Database connection", success: true });
    console.log('✅ Step 3: Database connected');

    // Step 4: Find user
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      debugSteps.push({ step: 4, action: "Find user", success: false, error: "User not found" });
      console.log('❌ Step 4: User not found');
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ 
          debugSteps,
          error: "Invalid email or password",
          debug: "User not found in database"
        })
      };
    }

    debugSteps.push({ 
      step: 4, 
      action: "Find user", 
      success: true, 
      data: { 
        userId: user.id, 
        email: user.email,
        passwordHashLength: user.password.length,
        passwordHashPrefix: user.password.substring(0, 10) + '...'
      } 
    });
    console.log('✅ Step 4: User found');

    // Step 5: Verify password
    console.log('🔑 Comparing password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    debugSteps.push({ 
      step: 5, 
      action: "Password verification", 
      success: isPasswordValid,
      data: {
        inputPassword: password,
        hashPrefix: user.password.substring(0, 20) + '...',
        bcryptResult: isPasswordValid
      }
    });

    if (!isPasswordValid) {
      console.log('❌ Step 5: Password verification failed');
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ 
          debugSteps,
          error: "Invalid email or password",
          debug: "Password verification failed"
        })
      };
    }
    console.log('✅ Step 5: Password verified');

    // Step 6: Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      debugSteps.push({ step: 6, action: "JWT Secret check", success: false, error: "JWT_SECRET not configured" });
      console.log('❌ Step 6: JWT Secret missing');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ debugSteps, error: "Server configuration error" })
      };
    }

    debugSteps.push({ step: 6, action: "JWT Secret check", success: true, data: { secretLength: jwtSecret.length } });
    console.log('✅ Step 6: JWT Secret available');

    const token = jwt.sign(
      { 
        sub: user.id, 
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    debugSteps.push({ step: 7, action: "JWT generation", success: true, data: { tokenLength: token.length } });
    console.log('✅ Step 7: JWT generated');

    // Step 8: Success response
    console.log('✅ Login successful!');
    
    const response = {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        debugSteps,
        success: true,
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        message: "Login successful via debug endpoint",
        timestamp: new Date().toISOString(),
        corsDebug: {
          origin: event.headers?.origin,
          allowedOrigin: corsHeaders["Access-Control-Allow-Origin"]
        }
      })
    };

    console.log('🔧 Final response headers:', JSON.stringify(response.headers, null, 2));
    return response;

  } catch (error) {
    console.error('❌ Login debug error:', error);
    
    debugSteps.push({ 
      step: 'error', 
      action: "Exception caught", 
      success: false, 
      error: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        debugSteps,
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        corsDebug: {
          origin: event.headers?.origin,
          allowedOrigin: corsHeaders["Access-Control-Allow-Origin"]
        }
      })
    };
  } finally {
    await prisma.$disconnect();
    console.log('🔧 Database disconnected');
  }
}; 