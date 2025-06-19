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
 * Simplified version to avoid 502 errors during function startup
 */
export const databaseProviderFactory = {
  provide: DATABASE_PROVIDER,
  useFactory: async (prismaService: PrismaService, inMemoryDbService: InMemoryDbService) => {
    const isNetlify = process.env.NETLIFY === 'true' || process.env.LAMBDA_TASK_ROOT;
    const isProduction = process.env.NODE_ENV === 'production';
    const databaseUrl = process.env.DATABASE_URL;
    
    // Rileva il tipo di database
    const isPostgreSQL = databaseUrl && (
      databaseUrl.startsWith('postgresql://') || 
      databaseUrl.startsWith('postgres://')
    );
    
    console.log('🔧 Database Configuration:');
    console.log(`   - Environment: ${isNetlify ? 'Netlify' : 'Local'}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   - Database Type: ${isPostgreSQL ? 'PostgreSQL' : 'SQLite'}`);
    
    try {
      // Simplified: Don't test connection during startup to avoid 502
      // Connection will be tested lazily when needed
      
      if (isNetlify && isPostgreSQL) {
        console.log('🌐 Using PrismaService with PostgreSQL (Supabase)');
        console.log('   - Connection will be tested on first use');
        return prismaService;
      } else if (!isNetlify) {
        console.log('🏠 Using PrismaService with SQLite (Local)');
        return prismaService;
      } else {
        console.log('✅ Using PrismaService (Environment auto-detected)');
        return prismaService;
      }
      
    } catch (error) {
      // If anything fails, fall back to in-memory database
      console.error('❌ Database provider setup failed, using in-memory fallback');
      console.error('Error details:', error.message);
      return inMemoryDbService;
    }
  },
  inject: [PrismaService, InMemoryDbService],
};

@Global()
@Module({
  imports: [ConfigModule], // 🔧 PrismaModule is global, so PrismaService is automatically available
  providers: [
    InMemoryDbService,
    databaseProviderFactory, // 🔧 Can inject PrismaService because PrismaModule is global
  ],
  exports: [
    InMemoryDbService,
    DATABASE_PROVIDER,
  ],
})
export class DatabaseModule {} 