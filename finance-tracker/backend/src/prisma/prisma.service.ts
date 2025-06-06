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
    // Skip database connection during startup to avoid timeouts
    // Database will be connected on-demand when first used
    this.logger.log('PrismaService initialized - database connection will be established on first use');
  }

  // Method to test database connection on-demand
  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Database connection test successful');
      return { connected: true };
    } catch (error) {
      this.logger.error('Database connection test failed:', error.message);
      return { connected: false, error: error.message };
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
