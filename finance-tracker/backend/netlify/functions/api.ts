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
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'], // Ridotto logging per performance
  });

  // No global prefix here - Netlify handles /api routing
  // app.setGlobalPrefix('api');

  // Validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
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
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.init();
  
  const serverlessApp = serverlessExpress(expressApp);
  cachedApp = serverlessApp;
  
  return serverlessApp;
}

export const handler = async (event, context) => {
  // Netlify function context optimization
  context.callbackWaitsForEmptyEventLoop = false;
  
  const app = await createApp();
  return app(event, context);
};