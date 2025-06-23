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

  @Get('db-direct')
  async testDatabaseDirect() {
    console.log('🧪 DIRECT DATABASE TEST - bypassing PrismaService');
    
    const databaseUrl = process.env.DATABASE_URL;
    console.log('🔍 Database URL available:', !!databaseUrl);
    console.log('🔍 Database URL prefix:', databaseUrl?.substring(0, 30) + '...');
    
    if (!databaseUrl) {
      return {
        status: 'error',
        message: 'DATABASE_URL not configured',
        timestamp: new Date().toISOString()
      };
    }
    
    try {
      // Parse URL per verificare formato
      const url = new URL(databaseUrl);
      console.log('🔍 Parsed URL - Protocol:', url.protocol);
      console.log('🔍 Parsed URL - Host:', url.hostname);
      console.log('🔍 Parsed URL - Port:', url.port);
      console.log('🔍 Parsed URL - Database:', url.pathname);
      console.log('🔍 Parsed URL - Params:', url.search);
      
      return {
        status: 'url-valid',
        message: 'Database URL is properly formatted',
        details: {
          protocol: url.protocol,
          host: url.hostname,
          port: url.port || 'default',
          database: url.pathname,
          hasParams: url.search.length > 0,
          paramCount: new URLSearchParams(url.search).size
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Database URL parsing failed:', error.message);
      
      return {
        status: 'url-invalid',
        message: 'Database URL format is invalid',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
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
