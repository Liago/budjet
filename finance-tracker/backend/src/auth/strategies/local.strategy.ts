import { Injectable, UnauthorizedException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    @Inject(forwardRef(() => AuthService)) private authService: AuthService // 🔧 FIX: Explicit injection with forwardRef
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
    
    // 🔧 ENHANCED LOGGING per debugging dependency injection
    console.log('🔧 LocalStrategy constructor - Dependency check:');
    console.log('🔧 - authService available:', !!this.authService);
    console.log('🔧 - authService type:', this.authService ? this.authService.constructor.name : 'undefined');
    console.log('🔧 - authService methods:', this.authService ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.authService)) : 'N/A');
    
    // 🔧 TEST AUTHSERVICE immediately  
    if (this.authService) {
      if (typeof this.authService.validateUser === 'function') {
        console.log('✅ LocalStrategy: AuthService.validateUser method available');
      } else {
        console.error('❌ LocalStrategy: AuthService.validateUser method NOT available');
      }
    } else {
      console.error('❌ CRITICAL: LocalStrategy - AuthService is not injected!');
    }
    
    this.logger.log('🔧 LocalStrategy initialized with email as username field');
  }

  async validate(email: string, password: string): Promise<any> {
    try {
      this.logger.log(`🔍 LocalStrategy validation started for: ${email?.substring(0, 3)}***`);
      this.logger.log(`🔍 LocalStrategy received - Email: ${!!email}, Password: ${!!password}`);
      this.logger.log(`🔍 Email length: ${email?.length}, Password length: ${password?.length}`);
      
      // 🔧 CRITICAL PRE-CHECKS
      if (!this.authService) {
        this.logger.error('❌ FATAL: AuthService is not available in LocalStrategy.validate()');
        this.logger.error('🔍 this.authService:', this.authService);
        throw new UnauthorizedException('Authentication service unavailable');
      }
      
      if (typeof this.authService.validateUser !== 'function') {
        this.logger.error('❌ FATAL: AuthService.validateUser is not a function');
        this.logger.error('🔍 AuthService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.authService)));
        throw new UnauthorizedException('Authentication method unavailable');
      }
      
      if (!email || !password) {
        this.logger.warn('❌ Missing email or password in LocalStrategy');
        throw new UnauthorizedException('Email and password are required');
      }

      this.logger.log('🔍 LocalStrategy calling AuthService.validateUser...');
      
      // 🔧 WRAP validateUser call with detailed error handling
      let user;
      try {
        user = await this.authService.validateUser(email, password);
        this.logger.log(`🔍 AuthService.validateUser completed, returned: ${!!user}`);
      } catch (validateError) {
        this.logger.error('❌ AuthService.validateUser failed:', {
          message: validateError.message,
          stack: validateError.stack,
          name: validateError.name
        });
        throw new UnauthorizedException('User validation failed');
      }
      
      if (!user) {
        this.logger.warn(`❌ LocalStrategy: Authentication failed for email: ${email?.substring(0, 3)}***`);
        this.logger.log('🔍 AuthService returned null/undefined user');
        throw new UnauthorizedException('Invalid email or password');
      }

      this.logger.log(`✅ LocalStrategy validation successful for user ID: ${user.id}`);
      this.logger.log(`🔍 User object keys: ${Object.keys(user)}`);
      this.logger.log(`🔍 User object preview:`, {
        id: user.id,
        email: user.email,
        hasFirstName: !!user.firstName,
        hasLastName: !!user.lastName
      });
      
      return user;
      
    } catch (error) {
      this.logger.error('❌ LocalStrategy validation error - COMPREHENSIVE:', {
        message: error.message,
        email: email?.substring(0, 3) + '***',
        stack: error.stack,
        name: error.name,
        isUnauthorized: error instanceof UnauthorizedException,
        hasAuthService: !!this.authService,
        authServiceType: this.authService ? this.authService.constructor.name : 'undefined'
      });
      
      // Re-throw UnauthorizedException as-is, wrap other errors
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Authentication failed: ' + error.message);
    }
  }
}