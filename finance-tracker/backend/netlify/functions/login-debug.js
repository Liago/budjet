const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * 🔧 LOGIN DEBUG FUNCTION
 * Testa ogni step del processo di login separatamente
 */

exports.handler = async (event, context) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" })
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
    } catch (e) {
      debugSteps.push({ step: 1, action: "Parse body", success: false, error: e.message });
      throw new Error('Invalid JSON body');
    }

    const { email, password } = body;

    // Step 2: Validate input
    if (!email || !password) {
      debugSteps.push({ step: 2, action: "Validate input", success: false, error: "Missing email or password" });
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ debugSteps, error: "Email and password required" })
      };
    }
    debugSteps.push({ step: 2, action: "Validate input", success: true });

    // Step 3: Connect to database
    await prisma.$connect();
    debugSteps.push({ step: 3, action: "Database connection", success: true });

    // Step 4: Find user
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      debugSteps.push({ step: 4, action: "Find user", success: false, error: "User not found" });
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

    // Step 5: Verify password
    console.log('🔑 Comparing password...');
    console.log('Input password:', password);
    console.log('Stored hash prefix:', user.password.substring(0, 20));
    
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
      console.log('❌ Password verification failed');
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

    // Step 6: Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      debugSteps.push({ step: 6, action: "JWT Secret check", success: false, error: "JWT_SECRET not configured" });
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ debugSteps, error: "Server configuration error" })
      };
    }

    debugSteps.push({ step: 6, action: "JWT Secret check", success: true, data: { secretLength: jwtSecret.length } });

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

    // Step 8: Success response
    console.log('✅ Login successful!');
    
    return {
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
        message: "Login successful via debug endpoint"
      })
    };

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
        timestamp: new Date().toISOString()
      })
    };
  } finally {
    await prisma.$disconnect();
  }
}; 