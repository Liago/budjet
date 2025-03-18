import { Module, Global, Provider } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InMemoryDbService } from './in-memory-db.service';
import { ConfigModule } from '@nestjs/config';

/**
 * Database provider token for dependency injection
 */
export const DATABASE_PROVIDER = 'DATABASE_PROVIDER';

/**
 * Factory function to determine which database service to use
 * Tries to use Prisma first, falls back to in-memory if Prisma fails
 */
export const databaseProviderFactory = {
  provide: DATABASE_PROVIDER,
  useFactory: async (prismaService: PrismaService, inMemoryDbService: InMemoryDbService) => {
    try {
      // Try to connect to the database using Prisma
      await prismaService.$connect();
      console.log('Using Prisma database service');
      return prismaService;
    } catch (error) {
      // If Prisma fails, fall back to in-memory database
      console.error('Prisma connection failed, falling back to in-memory database', error);
      return inMemoryDbService;
    }
  },
  inject: [PrismaService, InMemoryDbService],
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    InMemoryDbService,
    databaseProviderFactory,
  ],
  exports: [
    PrismaService,
    InMemoryDbService,
    DATABASE_PROVIDER,
  ],
})
export class DatabaseModule {} 