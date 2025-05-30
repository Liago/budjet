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

    // Set global prefix for all routes
    app.setGlobalPrefix("api");

    // Enable validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      })
    );

    // Enable CORS with specific configuration for Heroku
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      app.enableCors({
        origin: [
          "https://budjet-frontend.herokuapp.com",
          "https://bud-jet.netlify.app",
          // Add other origins as needed
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
      });
      logger.log("CORS configured for production environment");
    } else {
      app.enableCors();
      logger.log("CORS configured for development environment");
    }

    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle("Finance Tracker API")
      .setDescription("API documentation for the Finance Tracker application")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    // Start the server
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(
      `Swagger documentation available at: http://localhost:${port}/api/docs`
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
