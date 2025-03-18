import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    // Set global prefix for all routes
    app.setGlobalPrefix('api');
    
    // Enable validation pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    
    // Enable CORS
    app.enableCors();
    
    // Setup Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Finance Tracker API')
      .setDescription('API documentation for the Finance Tracker application')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    // Start the server
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
  } catch (error) {
    logger.error('Failed to start the application', error);
    
    // Provide more helpful error messages for common issues
    if (error.message && error.message.includes('libssl')) {
      logger.error(
        'This appears to be an issue with missing system libraries. ' +
        'The application will attempt to use an in-memory database instead.'
      );
    } else if (error.message && error.message.includes('Unable to open the database file')) {
      logger.error(
        'Failed to open the database file. ' +
        'Please check file permissions and path correctness.'
      );
    }
    
    // Exit with error code
    process.exit(1);
  }
}

bootstrap(); 