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
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    // Enhanced Prisma configuration for Netlify
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      errorFormat: "minimal",
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      
      // Enhanced connection configuration for serverless
      ...(process.env.NETLIFY === 'true' && {
        __internal: {
          engine: {
            connectTimeout: 10000,      // 10 seconds timeout
            idleTimeout: 30000,         // 30 seconds idle timeout
            maxConnections: 1,          // Limit connections for serverless
          },
        },
      }),
    });
    
    this.logger.log('PrismaService initialized with URL:', databaseUrl.substring(0, 30) + '...');
  }

  async onModuleInit() {
    try {
      // Force immediate connection for serverless environments
      if (process.env.NETLIFY === 'true') {
        this.logger.log('Netlify environment detected - establishing database connection...');
        await this.ensureConnected();
      } else {
        this.logger.log('Local environment - lazy connection initialization');
      }
    } catch (error) {
      this.logger.error('Failed to initialize database connection:', error.message);
      // Don't throw here to allow the app to start even if DB is temporarily unavailable
    }
  }

  // Ensure database connection with retry logic
  private async ensureConnected(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.connectWithRetry();
    return this.connectionPromise;
  }

  private async connectWithRetry(maxRetries: number = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Database connection attempt ${attempt}/${maxRetries}...`);
        
        await this.$connect();
        
        // Test the connection with a simple query
        await this.$queryRaw`SELECT 1 as test`;
        
        this.isConnected = true;
        this.logger.log('✅ Database connection established successfully');
        return;
        
      } catch (error) {
        this.logger.error(`❌ Connection attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        this.logger.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Query methods will automatically use ensureConnected through other methods

  // Test database connection on-demand
  async testConnection(): Promise<{ connected: boolean; error?: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      await this.ensureConnected();
      await this.$queryRaw`SELECT 1 as health_check`;
      
      const latency = Date.now() - startTime;
      this.logger.log(`Database health check passed (${latency}ms)`);
      
      return { 
        connected: true, 
        latency 
      };
      
    } catch (error) {
      this.logger.error('Database health check failed:', error.message);
      this.isConnected = false; // Reset connection status
      this.connectionPromise = null; // Reset connection promise
      
      return { 
        connected: false, 
        error: error.message,
        latency: Date.now() - startTime
      };
    }
  }

  async onModuleDestroy() {
    try {
      if (this.isConnected) {
        await this.$disconnect();
        this.isConnected = false;
        this.logger.log('Database connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing database connection:', error.message);
    }
  }

  // Method to reset connection (useful for testing)
  async resetConnection(): Promise<void> {
    try {
      await this.$disconnect();
    } catch (error) {
      // Ignore disconnect errors
    }
    
    this.isConnected = false;
    this.connectionPromise = null;
    await this.ensureConnected();
  }
}
