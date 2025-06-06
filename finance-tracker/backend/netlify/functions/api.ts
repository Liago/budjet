import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from 'serverless-http';
import express from 'express';

let cachedApp;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  console.log('🚀 Creating Netlify NestJS app...');
  const expressApp = express();
  
  // Create NestJS app with minimal configuration
  console.log('📦 Initializing NestJS with AppModule...');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn', 'log'], // Add 'log' for more visibility
    abortOnError: false, // Continue even if optional modules fail
  });

  // No global prefix for Netlify Functions - routing handled by Netlify
  console.log('🔧 Configuring NestJS app...');
  // app.setGlobalPrefix('api');

  // Validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
    })
  );

  // CORS configuration
  app.enableCors({
    origin: [
      'https://bud-jet.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  await app.init();
  
  // Debug: log registered routes
  console.log('🗺️ NestJS app initialized, checking routes...');
  const router = app.getHttpAdapter().getInstance();
  console.log('🗺️ Express app created, routes should be available at:', {
    root: 'GET /',
    health: 'GET /health'
  });
  
  const serverlessApp = serverlessExpress(expressApp);
  cachedApp = serverlessApp;
  
  console.log('✅ Netlify function created successfully!');
  return serverlessApp;
}

export const handler: Handler = async (event, context) => {
  // Optimize Netlify function context
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Debug: log incoming request
  console.log('📨 Incoming request:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    queryStringParameters: event.queryStringParameters
  });
  
  try {
    const app = await createApp();
    console.log('🚀 Processing request through serverless express...');
    const result = await app(event, context);
    
    // Debug: log response
    console.log('📤 Response details:', {
      statusCode: result.statusCode,
      headers: result.headers,
      bodyLength: result.body ? result.body.length : 0,
      bodyPreview: result.body ? result.body.substring(0, 100) : 'no body'
    });
    
    console.log('✅ Request processed successfully');
    return result;
  } catch (error) {
    console.error('❌ Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://bud-jet.netlify.app',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      })
    };
  }
};
