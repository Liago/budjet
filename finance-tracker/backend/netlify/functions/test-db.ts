// Test endpoint per verificare connessione database
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
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
    // Test connessione senza NestJS
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Test query semplice
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    await prisma.$disconnect();

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'OK',
        database: 'connected',
        test_query: result,
        env_vars: {
          DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
          NODE_ENV: process.env.NODE_ENV || 'undefined',
          JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing'
        }
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'ERROR',
        error: error.message,
        env_vars: {
          DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
          NODE_ENV: process.env.NODE_ENV || 'undefined',
          JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing'
        }
      })
    };
  }
};
