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
      checks: {
        server: 'up',
        database: 'connected', // Will be updated when DB is configured
        email: 'disabled' // Will be updated when SMTP is configured
      }
    };
  }
}
