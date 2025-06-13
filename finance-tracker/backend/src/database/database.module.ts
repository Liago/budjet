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
 * Auto-detects environment and chooses appropriate database
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
    
    try {
      console.log('🔧 Database Configuration Detection:');
      console.log(`   - Environment: ${isNetlify ? 'Netlify' : 'Local'}`);
      console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(`   - Database Type: ${isPostgreSQL ? 'PostgreSQL' : 'SQLite'}`);
      console.log(`   - URL: ${databaseUrl ? databaseUrl.substring(0, 30) + '...' : 'Not set'}`);
      
      // Test the connection
      const connectionTest = await prismaService.testConnection();
      
      if (connectionTest.connected) {
        const dbType = connectionTest.provider?.toUpperCase() || 'Unknown';
        console.log(`✅ Using PrismaService with ${dbType} database`);
        console.log(`📊 Connection latency: ${connectionTest.latency}ms`);
        
        // Log appropriate database usage
        if (isNetlify && connectionTest.provider === 'postgresql') {
          console.log('🌐 Production mode: Supabase PostgreSQL');
        } else if (!isNetlify && connectionTest.provider === 'sqlite') {
          console.log('🏠 Development mode: Local SQLite');
        } else {
          console.log(`⚠️  Mixed configuration: ${isNetlify ? 'Netlify' : 'Local'} environment with ${dbType}`);
        }
        
        return prismaService;
      } else {
        throw new Error(`Database connection test failed: ${connectionTest.error}`);
      }
    } catch (error) {
      // If Prisma fails, fall back to in-memory database
      console.error('❌ Prisma connection failed, falling back to in-memory database');
      console.error('Error details:', error.message);
      console.log('⚠️  Using InMemoryDbService - data will not persist!');
      console.log('🔧 Troubleshooting tips:');
      
      if (isNetlify) {
        console.log('   1. Check DATABASE_URL environment variable on Netlify');
        console.log('   2. Verify Supabase connection string format');
        console.log('   3. Ensure database is accessible from Netlify');
      } else {
        console.log('   1. Check if SQLite database file exists');
        console.log('   2. Run: npx prisma db push');
        console.log('   3. Verify file permissions');
      }
      
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