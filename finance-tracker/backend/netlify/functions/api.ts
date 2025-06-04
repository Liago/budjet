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

  const expressApp = express();
  
  // Create NestJS app with minimal configuration
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
    abortOnError: false, // Continue even if optional modules fail
  });

  // No global prefix - Netlify handles /api routing via redirects
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
  
  const serverlessApp = serverlessExpress(expressApp);
  cachedApp = serverlessApp;
  
  return serverlessApp;
}

export const handler: Handler = async (event, context) => {
  // Optimize Netlify function context
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const app = await createApp();
    return await app(event, context);
  } catch (error) {
    console.error('Function error:', error);
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