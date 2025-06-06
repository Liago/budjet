// Importa il polyfill crypto come prima cosa
import "./crypto-polyfill";

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Carica il file .env appropriato in base all'ambiente
const NODE_ENV = process.env.NODE_ENV || "development";
const envFile = `.env.${NODE_ENV}`;
const envPath = path.resolve(__dirname, "..", envFile);

if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envFile}`);
  dotenv.config({ path: envPath });
} else {
  console.log(`Environment file ${envFile} not found, using default .env`);
  dotenv.config();
}

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  try {
    const app = await NestFactory.create(AppModule);

    // Set global prefix for all routes - only in non-Netlify environments
    const isNetlify = process.env.NETLIFY === 'true' || process.env.LAMBDA_TASK_ROOT;
    
    // Debug logging for environment detection
    logger.log(`Environment variables: NETLIFY=${process.env.NETLIFY}, LAMBDA_TASK_ROOT=${!!process.env.LAMBDA_TASK_ROOT}`);
    logger.log(`Detected environment: ${isNetlify ? 'Netlify' : 'Local'}`);
    
    if (!isNetlify) {
      app.setGlobalPrefix("api");
      console.log('Running locally - using /api prefix');
    } else {
      console.log('Running on Netlify - no prefix needed');
    }

    // Enable validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    // Enable CORS with specific configuration
    const isProduction = process.env.NODE_ENV === "production" || isNetlify;
    logger.log(`CORS Configuration: isProduction=${isProduction}, NODE_ENV=${process.env.NODE_ENV}`);
    
    if (isProduction) {
      const allowedOrigins = [
        "https://budjet-frontend.herokuapp.com",
        "https://bud-jet.netlify.app",
        "https://bud-jet-frontend.netlify.app",
        "http://localhost:3000",
        "http://localhost:19006", // Expo dev
        // Add other origins as needed
      ];
      
      app.enableCors({
        origin: function (origin, callback) {
          // Allow requests with no origin (mobile apps, Postman, etc.)
          if (!origin) return callback(null, true);
          
          if (allowedOrigins.includes(origin)) {
            logger.log(`✅ CORS: Allowing origin ${origin}`);
            return callback(null, true);
          } else {
            logger.warn(`❌ CORS: Rejecting origin ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
          }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 200,
      });
      logger.log(`CORS configured for production. Allowed origins: ${allowedOrigins.join(', ')}`);
    } else {
      app.enableCors({
        origin: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
        credentials: true,
      });
      logger.log("CORS configured for development environment (allow all)");
    }

    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle("Finance Tracker API")
      .setDescription("API documentation for the Finance Tracker application")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    const swaggerPath = isNetlify ? "docs" : "api/docs";
    SwaggerModule.setup(swaggerPath, app, document);

    // Start the server
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(
      `Swagger documentation available at: http://localhost:${port}/${swaggerPath}`
    );

    // Log application mode
    logger.log(
      `Application running in ${process.env.NODE_ENV || "development"} mode`
    );
  } catch (error) {
    logger.error("Failed to start the application", error);

    // Provide more helpful error messages for common issues
    if (error.message && error.message.includes("libssl")) {
      logger.error(
        "This appears to be an issue with missing system libraries. " +
          "The application will attempt to use an in-memory database instead."
      );
    } else if (
      error.message &&
      error.message.includes("Unable to open the database file")
    ) {
      logger.error(
        "Failed to open the database file. " +
          "Please check file permissions and path correctness."
      );
    }

    // Exit with error code
    process.exit(1);
  }
}

bootstrap();
