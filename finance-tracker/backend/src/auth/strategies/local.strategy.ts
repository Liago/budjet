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
      this.logger.log(`🔍 LocalStrategy received - Email: ${!!email}, Password: ${!!password}`);
      this.logger.log(`🔍 Email length: ${email?.length}, Password length: ${password?.length}`);
      
      if (!email || !password) {
        this.logger.warn('❌ Missing email or password in LocalStrategy');
        throw new UnauthorizedException('Email and password are required');
      }

      this.logger.log('🔍 LocalStrategy calling AuthService.validateUser...');
      
      // Validate credentials using AuthService
      const user = await this.authService.validateUser(email, password);
      
      this.logger.log(`🔍 AuthService.validateUser returned: ${!!user}`);
      
      if (!user) {
        this.logger.warn(`❌ LocalStrategy: Authentication failed for email: ${email?.substring(0, 3)}***`);
        this.logger.log('🔍 AuthService returned null/undefined user');
        throw new UnauthorizedException('Invalid email or password');
      }

      this.logger.log(`✅ LocalStrategy validation successful for user ID: ${user.id}`);
      this.logger.log(`🔍 User object keys: ${Object.keys(user)}`);
      
      return user;
      
    } catch (error) {
      this.logger.error('❌ LocalStrategy validation error - DETAILED:', {
        message: error.message,
        email: email?.substring(0, 3) + '***',
        stack: error.stack,
        name: error.name,
        isUnauthorized: error instanceof UnauthorizedException
      });
      
      // Re-throw UnauthorizedException as-is, wrap other errors
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
