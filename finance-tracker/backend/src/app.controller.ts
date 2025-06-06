import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

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

  @Get('health')
  async getHealthCheck() {
    // Test database connection on-demand
    const dbTest = await this.prisma.testConnection();
    
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
      }
    };
  }
}
