import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
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
  getHealthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        server: 'up',
        database: 'checking...', // Will be updated after Prisma init
        email: process.env.SMTP_HOST ? 'configured' : 'disabled'
      },
      netlify: {
        region: process.env.AWS_REGION || 'unknown',
        requestId: process.env.AWS_REQUEST_ID || 'local'
      }
    };
  }
}
