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
    const maxRetries = 3;
    let currentTry = 0;
    
    while (currentTry < maxRetries) {
      try {
        this.logger.log(`Attempting database connection (try ${currentTry + 1}/${maxRetries})...`);
        await this.$connect();
        this.logger.log("Successfully connected to database");
        
        // Test query to verify connection
        await this.$queryRaw`SELECT 1`;
        this.logger.log("Database connection verified with test query");
        return;
      } catch (error) {
        currentTry++;
        this.logger.error(`Database connection attempt ${currentTry} failed:`, error.message);
        
        if (currentTry >= maxRetries) {
          this.logger.error("All database connection attempts failed, continuing without DB");
          // Don't throw error - let the app start even if DB fails
          return;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000 * currentTry));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
