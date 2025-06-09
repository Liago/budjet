import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from 'serverless-http';
import express from 'express';

let cachedApp;

// CORS headers configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Temporaneamente permetti tutto per debug
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, Accept, Origin, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin'
};

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const logger = new Logger('NetlifyFunction');
  
  try {
    logger.log('🚀 Creating Netlify NestJS app...');
    const expressApp = express();
    
    // Ensure required environment variables are set
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    if (!process.env.JWT_SECRET) {
      logger.warn('JWT_SECRET not set, using fallback');
      process.env.JWT_SECRET = 'fallback-jwt-secret-for-development-minimum-32-chars';
    }

    // Set NODE_ENV to production if not set
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }

    logger.log('📦 Initializing NestJS with AppModule...');
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
      logger: ['error', 'warn', 'log'],
      abortOnError: false,
      bufferLogs: true,
    });

    logger.log('🔧 Configuring NestJS app...');
    
    // Global validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        validateCustomDecorators: true,
      })
    );

    // CORS configuration - molto permissiva per il debug iniziale
    app.enableCors({
      origin: true, // Permetti tutti gli origin per ora
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'x-requested-with', 
        'Accept',
        'Origin',
        'X-Requested-With'
      ],
      preflightContinue: false,
      optionsSuccessStatus: 200
    });

    // Initialize the app
    await app.init();
    
    logger.log('✅ NestJS app initialized successfully!');
    
    const serverlessApp = serverlessExpress(expressApp);
    cachedApp = serverlessApp;
    
    return serverlessApp;
    
  } catch (error) {
    logger.error('❌ Failed to create app:', error);
    throw error;
  }
}

export const handler: Handler = async (event, context) => {
  const logger = new Logger('NetlifyHandler');
  
  // Optimize Netlify function context
  context.callbackWaitsForEmptyEventLoop = false;
  
  // **PRIORITÀ ASSOLUTA: Gestisci OPTIONS preflight IMMEDIATAMENTE**
  if (event.httpMethod === 'OPTIONS') {
    logger.log('🔄 Handling OPTIONS preflight request');
    
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };
  }
  
  try {
    // Enhanced path transformation with better logging
    const originalPath = event.path;
    const functionPrefix = '/.netlify/functions/api';
    
    // Transform path: /.netlify/functions/api -> /
    // Transform path: /.netlify/functions/api/auth/login -> /auth/login
    if (originalPath.startsWith(functionPrefix)) {
      event.path = originalPath.slice(functionPrefix.length) || '/';
    }
    
    // Debug: log request details
    logger.log('🔄 Request details:', {
      original: originalPath,
      transformed: event.path,
      method: event.httpMethod,
      origin: event.headers?.origin || 'no-origin',
      userAgent: event.headers?.['user-agent']?.substring(0, 50) || 'no-user-agent',
      contentType: event.headers?.['content-type'] || 'no-content-type'
    });
    
    const app = await createApp();
    logger.log('🚀 Processing request through serverless express...');
    
    const result = await app(event, context);
    
    // **IMPORTANTE: Assicurati che TUTTI i response abbiano headers CORS**
    if (!result.headers) {
      result.headers = {};
    }
    
    // Aggiungi sempre gli headers CORS
    Object.assign(result.headers, CORS_HEADERS);
    
    // Override origin specifico se fornito
    if (event.headers?.origin) {
      result.headers['Access-Control-Allow-Origin'] = event.headers.origin;
    }
    
    logger.log('📤 Response details:', {
      statusCode: result.statusCode,
      corsHeaders: !!result.headers['Access-Control-Allow-Origin'],
      bodyLength: result.body ? result.body.length : 0
    });
    
    logger.log('✅ Request processed successfully');
    return result;
    
  } catch (error) {
    logger.error('❌ Function error details:', {
      message: error.message,
      stack: error.stack?.split('\n')[0], // Solo prima linea dello stack
      name: error.name
    });
    
    // **IMPORTANTE: Anche gli errori devono avere headers CORS**
    return {
      statusCode: 500,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        // Override origin specifico se fornito
        'Access-Control-Allow-Origin': event.headers?.origin || '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString(),
        path: event.path,
        method: event.httpMethod
      })
    };
  }
};
