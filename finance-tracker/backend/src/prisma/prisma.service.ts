import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    
    // Call super first (required in TypeScript)
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      errorFormat: "minimal",
      log: ["error", "warn"], // Reduced logging for production
      // SSL configuration for Supabase
      ...(process.env.NODE_ENV === 'production' && {
        __internal: {
          engine: {
            connectTimeout: 60000,
            idleTimeout: 60000,
          },
        },
      }),
    });
    
    // Log warnings after super() call
    if (!databaseUrl) {
      console.warn('[PrismaService] DATABASE_URL non configurato');
    } else {
      console.log('[PrismaService] Database URL configured:', databaseUrl.substring(0, 30) + '...');
    }
  }

  async onModuleInit() {
    try {
      this.logger.log('Attempting database connection...');
      
      // Single connection attempt with timeout
      const connectionPromise = this.$connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 8000)
      );
      
      await Promise.race([connectionPromise, timeoutPromise]);
      this.logger.log('Successfully connected to database');
      
      // Quick test query
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Database connection verified');
      
    } catch (error) {
      this.logger.error('Database connection failed:', error.message);
      this.logger.warn('Continuing without database - API will use fallback mode');
      // Don't throw - let app start without DB
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
