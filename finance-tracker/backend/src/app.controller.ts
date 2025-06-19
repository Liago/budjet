import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService
  ) {
    console.log('🔧 AppController initialized, prisma:', !!this.prisma);
  }

  @Get()
  getHealth() {
    return {
      status: 'OK',
      message: 'Bud-Jet Backend API is running',
      timestamp: new Date().toISOString(),
      service: 'finance-tracker-backend',
      version: '1.0.0'
    };
  }

  @Get('simple')
  getSimple() {
    console.log('🧪 SIMPLE endpoint called - no dependencies');
    return {
      status: 'simple-ok',
      timestamp: new Date().toISOString(),
      message: 'Simple endpoint without database dependency'
    };
  }

  @Get('health')
  async getHealthCheck() {
    console.log('🔍 HEALTH endpoint called');
    console.log('🔍 this.prisma available:', !!this.prisma);
    console.log('🔍 this.prisma methods:', this.prisma ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.prisma)) : 'N/A');
    
    let dbTest = { connected: false, error: 'Database test not attempted' };
    
    try {
      if (!this.prisma) {
        throw new Error('PrismaService is not available - dependency injection failed');
      }
      
      if (typeof this.prisma.testConnection !== 'function') {
        throw new Error('PrismaService.testConnection method is not available');
      }
      
      console.log('🔍 Testing database connection...');
      // Test database connection con timeout aumentato per Netlify
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database test timeout after 15 seconds')), 15000); // 🔧 Aumentato da 5 a 15 secondi
      });
      
      const testPromise = this.prisma.testConnection();
      dbTest = await Promise.race([testPromise, timeoutPromise]) as any;
      console.log('✅ Database test completed:', dbTest);
      
    } catch (error) {
      console.error('❌ Database test failed:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      dbTest = {
        connected: false,
        error: `Database test failed: ${error.message} (${error.name})`
      };
    }
    
    console.log('📦 Returning health response');
    
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        server: 'up',
        database: dbTest.connected ? 'connected' : 'disconnected',
        databaseError: dbTest.error || null,
        email: process.env.SMTP_HOST ? 'configured' : 'disabled'
      },
      netlify: {
        region: process.env.AWS_REGION || 'unknown',
        requestId: process.env.AWS_REQUEST_ID || 'local'
      },
      debug: {
        databaseTest: dbTest,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
        prismaInjected: !!this.prisma,
        prismaType: this.prisma ? this.prisma.constructor.name : 'undefined'
      }
    };
  }
}
