import { Handler } from "@netlify/functions";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../src/app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ExpressAdapter } from "@nestjs/platform-express";
import serverlessExpress from "serverless-http";
import express from "express";

let cachedApp;

// 🔧 GLOBAL ERROR HANDLER
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION:', {
    reason: reason,
    promise: promise
  });
});

// CORS headers configuration - CONFIGURAZIONE AGGIORNATA
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Temporaneamente permissivo per debug
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, x-requested-with, Accept, Origin, X-Requested-With",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
};

// Lista di origini permesse - AGGIORNA QUESTI URL
const ALLOWED_ORIGINS = [
  "https://bud-jet.netlify.app", // URL principale del frontend
  "https://bud-jet-frontend.netlify.app", // URL alternativo
  "http://localhost:3000", // Sviluppo locale
  "http://localhost:5173", // Vite dev server
  "http://localhost:4173", // Vite preview
];

function getCorsOrigin(requestOrigin: string | undefined): string {
  // Se non c'è origin (richieste da mobile/Postman), permetti
  if (!requestOrigin) return "*";

  // Se l'origin è nella lista permessa, usalo
  if (ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Per debug, permetti tutti gli origin che contengono "netlify"
  if (requestOrigin.includes("netlify.app")) {
    return requestOrigin;
  }

  // Altrimenti nega
  return "null";
}

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const logger = new Logger("NetlifyFunction");

  try {
    logger.log("🚀 Creating Netlify NestJS app...");
    
    // 🔧 LOG ENVIRONMENT VARIABLES (MASKED)
    logger.log("🔧 Environment Check:", {
      NODE_ENV: process.env.NODE_ENV,
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...'
    });

    const expressApp = express();

    // 🔧 VALIDATE CRITICAL ENVIRONMENT VARIABLES
    if (!process.env.DATABASE_URL) {
      const error = new Error("DATABASE_URL environment variable is required");
      logger.error("❌ CRITICAL: DATABASE_URL missing");
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      logger.warn("⚠️ JWT_SECRET not set, using fallback");
      process.env.JWT_SECRET = "fallback-jwt-secret-for-development-minimum-32-chars";
    } else if (process.env.JWT_SECRET.length < 32) {
      logger.warn("⚠️ JWT_SECRET is too short (< 32 chars)");
    }

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = "production";
    }

    logger.log("📦 Initializing NestJS with AppModule...");
    // 🔧 ENHANCED APP CREATION WITH ERROR HANDLING
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        logger: ["error", "warn", "log", "debug"], // 🔧 MORE VERBOSE LOGGING
        abortOnError: false,
        bufferLogs: true,
      }
    );

    logger.log("🔧 Configuring NestJS app...");

    // 🔧 ENHANCED VALIDATION PIPES WITH ERROR LOGGING
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        validateCustomDecorators: true,
        // 🔧 MORE DETAILED VALIDATION ERRORS
        exceptionFactory: (errors) => {
          logger.error("❌ Validation errors:", errors);
          return new Error(`Validation failed: ${JSON.stringify(errors)}`);
        }
      })
    );

    // CORS configuration MIGLIORATA
    app.enableCors({
      origin: function (origin, callback) {
        const allowedOrigin = getCorsOrigin(origin);
        logger.log(
          `🌐 CORS Check: Origin="${origin}" -> Allowed="${allowedOrigin}"`
        );

        if (allowedOrigin === "null") {
          logger.warn(`❌ CORS DENIED for origin: ${origin}`);
          callback(new Error("Not allowed by CORS"), false);
        } else {
          callback(null, true);
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-requested-with",
        "Accept",
        "Origin",
        "X-Requested-With",
      ],
      preflightContinue: false,
      optionsSuccessStatus: 200,
    });

    // 🔧 TEST DATABASE CONNECTION DURING INITIALIZATION
    try {
      logger.log("🔗 Testing database connection during app init...");
      const { PrismaService } = await import("../../src/prisma/prisma.service");
      const prisma = new PrismaService();
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      logger.log("✅ Database connection test successful");
      await prisma.$disconnect();
    } catch (dbError) {
      logger.error("❌ Database connection failed during init:", {
        message: dbError.message,
        stack: dbError.stack
      });
      // Don't throw here, let the app try to handle it later
    }

    await app.init();
    logger.log("✅ NestJS app initialized successfully!");

    const serverlessApp = serverlessExpress(expressApp);
    cachedApp = serverlessApp;

    return serverlessApp;
    
  } catch (error) {
    logger.error("❌ Failed to create app - DETAILED ERROR:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    throw error;
  }
}

export const handler: Handler = async (event, context) => {
  const logger = new Logger("NetlifyHandler");

  // Optimize Netlify function context
  context.callbackWaitsForEmptyEventLoop = false;

  const requestOrigin = event.headers?.origin || event.headers?.Origin;

  // 🔧 LOG INCOMING REQUEST DETAILS
  logger.log("🔄 Incoming request:", {
    method: event.httpMethod,
    path: event.path,
    origin: requestOrigin,
    hasBody: !!event.body,
    bodyLength: event.body?.length || 0,
    headers: Object.keys(event.headers || {})
  });

  // **PRIORITÀ ASSOLUTA: Gestisci OPTIONS preflight IMMEDIATAMENTE**
  if (event.httpMethod === "OPTIONS") {
    logger.log("🔄 Handling OPTIONS preflight request", {
      origin: requestOrigin,
      path: event.path,
      headers: event.headers,
    });

    // Determina l'origin corretto
    const allowedOrigin = getCorsOrigin(requestOrigin);

    const responseHeaders = {
      ...CORS_HEADERS,
      "Access-Control-Allow-Origin": allowedOrigin,
    };

    logger.log("✅ OPTIONS Response headers:", responseHeaders);

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({ message: "CORS preflight successful" }),
    };
  }

  try {
    // Enhanced path transformation
    const originalPath = event.path;
    const functionPrefix = "/.netlify/functions/api";

    if (originalPath.startsWith(functionPrefix)) {
      event.path = originalPath.slice(functionPrefix.length) || "/";
    }

    logger.log("🔄 Request details:", {
      original: originalPath,
      transformed: event.path,
      method: event.httpMethod,
      origin: requestOrigin,
      userAgent: event.headers?.["user-agent"]?.substring(0, 50),
    });

    // 🔧 ENHANCED APP CREATION WITH DETAILED ERROR HANDLING
    logger.log("🚀 Getting app instance...");
    const app = await createApp();
    
    logger.log("🚀 Processing request through serverless express...");
    
    // 🔧 WRAP THE SERVERLESS CALL WITH DETAILED ERROR HANDLING
    let result;
    try {
      result = await app(event, context);
      logger.log("✅ Serverless express completed successfully");
    } catch (serverlessError) {
      logger.error("❌ Serverless express error:", {
        message: serverlessError.message,
        stack: serverlessError.stack,
        name: serverlessError.name
      });
      throw serverlessError;
    }

    // **IMPORTANTE: Assicurati che TUTTI i response abbiano headers CORS**
    if (!result.headers) {
      result.headers = {};
    }

    // Determina l'origin corretto per la risposta
    const allowedOrigin = getCorsOrigin(requestOrigin);

    // Aggiungi sempre gli headers CORS con l'origin corretto
    Object.assign(result.headers, {
      ...CORS_HEADERS,
      "Access-Control-Allow-Origin": allowedOrigin,
    });

    logger.log("📤 Response details:", {
      statusCode: result.statusCode,
      corsOrigin: result.headers["Access-Control-Allow-Origin"],
      bodyLength: result.body ? result.body.length : 0,
    });

    logger.log("✅ Request processed successfully");
    return result;
  } catch (error) {
    logger.error("❌ Function error - COMPREHENSIVE DETAILS:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
      origin: requestOrigin,
      path: event.path,
      method: event.httpMethod,
      timestamp: new Date().toISOString()
    });

    // Return detailed error for debugging
    const allowedOrigin = getCorsOrigin(requestOrigin);
    const errorHeaders = {
      ...CORS_HEADERS,
      "Access-Control-Allow-Origin": allowedOrigin,
      "Content-Type": "application/json",
    };

    return {
      statusCode: 500,
      headers: errorHeaders,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message, // 🔧 ALWAYS INCLUDE ERROR MESSAGE FOR DEBUGGING
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        path: event.path,
        method: event.httpMethod,
        requestId: context.awsRequestId
      }),
    };
  }
};
