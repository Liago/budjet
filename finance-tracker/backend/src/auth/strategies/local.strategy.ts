import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
    
    this.logger.log('🔧 LocalStrategy initialized with email as username field');
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      this.logger.log(`🔍 LocalStrategy validation started for: ${email?.substring(0, 3)}***`);
      
      if (!email || !password) {
        this.logger.warn('❌ Missing email or password in request');
        throw new UnauthorizedException('Email and password are required');
      }

      // Validate credentials using AuthService
      const user = await this.authService.validateUser(email, password);
      
      if (!user) {
        this.logger.warn(`❌ Authentication failed for email: ${email?.substring(0, 3)}***`);
        throw new UnauthorizedException('Invalid email or password');
      }

      this.logger.log(`✅ LocalStrategy validation successful for user ID: ${user.id}`);
      return user;
      
    } catch (error) {
      this.logger.error('❌ LocalStrategy validation error:', {
        message: error.message,
        email: email?.substring(0, 3) + '***',
        stack: error.stack
      });
      
      // Re-throw UnauthorizedException as-is, wrap other errors
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
