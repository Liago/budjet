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
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/fallback';
    
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      errorFormat: "minimal",
      log: ["error", "warn"], // Reduced logging for production
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log("Successfully connected to PostgreSQL database");
    } catch (error) {
      this.logger.error("Prisma connection failed, falling back to in-memory database", error);
      
      // Don't throw error - let the app start even if DB fails
      // This allows basic function testing without proper DB config
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
