const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

/**
 * 🔧 FUNZIONE NETLIFY PER CREARE UTENTE IN PRODUZIONE
 * Accesso: https://bud-jet-be.netlify.app/.netlify/functions/create-user-production
 */

exports.handler = async (event, context) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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

  // Solo GET per sicurezza
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const prisma = new PrismaClient();

  try {
    console.log('🔧 Creating user in PRODUCTION database...');
    
    // Verifica connessione
    await prisma.$connect();
    console.log('✅ Connected to production database');

    // Controlla se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: { email: 'andrea.zampierolo@me.com' }
    });

    if (existingUser) {
      console.log('👤 User already exists, updating password...');
      
      // Aggiorna password
      const hashedPassword = await bcrypt.hash('MandingO', 12);
      const updatedUser = await prisma.user.update({
        where: { email: 'andrea.zampierolo@me.com' },
        data: { password: hashedPassword }
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          action: "updated",
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName
          },
          message: "Password updated successfully in production database",
          timestamp: new Date().toISOString()
        })
      };
    } else {
      console.log('➕ Creating new user...');
      
      // Crea nuovo utente
      const hashedPassword = await bcrypt.hash('MandingO', 12);
      const newUser = await prisma.user.create({
        data: {
          email: 'andrea.zampierolo@me.com',
          password: hashedPassword,
          firstName: 'Andrea',
          lastName: 'Zampierolo'
        }
      });

      console.log('✅ User created successfully:', newUser.id);

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          action: "created",
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName
          },
          message: "User created successfully in production database",
          timestamp: new Date().toISOString()
        })
      };
    }

  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          HAS_DATABASE_URL: !!process.env.DATABASE_URL,
          DATABASE_URL_PREFIX: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET'
        }
      })
    };
  } finally {
    await prisma.$disconnect();
  }
}; 