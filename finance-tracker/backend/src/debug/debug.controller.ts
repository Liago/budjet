import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('debug')
@Controller('debug')
export class DebugController {
  
  // Endpoint NON protetto per test di base
  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'Debug controller is working'
    };
  }

  // Endpoint protetto SENZA PrismaService per testare solo JWT
  @Get('auth-test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAuthTest() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      message: 'JWT authentication is working',
      authenticated: true
    };
  }

  // Endpoint che testa il problema specifico
  @Get('minimal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMinimalTest() {
    try {
      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Minimal protected endpoint working'
      };
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message,
        stack: error.stack
      };
    }
  }
}
