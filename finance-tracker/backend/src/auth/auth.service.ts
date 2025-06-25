import { Injectable, Logger, Inject, forwardRef } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService, // 🔧 FIX: Ripristino forwardRef per evitare circular dependency
    @Inject(JwtService) private readonly jwtService: JwtService, // 🔧 FIX: Injection esplicita con forwardRef se necessario
    @Inject('JWT_DEBUG') private jwtDebug: boolean // 🔧 AGGIUNTA: Inject del debug provider
  ) {
    // 🔧 ENHANCED LOGGING con più dettagli
    console.log('🔧 AuthService constructor - COMPREHENSIVE CHECK:');
    console.log('🔧 - usersService available:', !!this.usersService);
    console.log('🔧 - jwtService available:', !!this.jwtService);
    console.log('🔧 - jwtDebug injected:', !!this.jwtDebug);
    
    // 🔧 DETAILED USERSERVICE CHECK
    if (this.usersService) {
      console.log('🔧 UsersService details:');
      console.log('🔧 - Type:', this.usersService.constructor.name);
      console.log('🔧 - Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.usersService)));
    } else {
      console.error('❌ CRITICAL: UsersService is not injected!');
    }
    
    // 🔧 DETAILED JWTSERVICE CHECK
    if (this.jwtService) {
      console.log('🔧 JwtService details:');
      console.log('🔧 - Type:', this.jwtService.constructor.name);
      console.log('🔧 - Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.jwtService)));
      console.log('🔧 - sign method available:', typeof this.jwtService.sign === 'function');
      console.log('🔧 - verify method available:', typeof this.jwtService.verify === 'function');
      
      // 🔧 TEST JWT SERVICE immediately
      try {
        const testPayload = { test: true, iat: Math.floor(Date.now() / 1000) };
        const testToken = this.jwtService.sign(testPayload);
        console.log('✅ JwtService test successful - token length:', testToken?.length);
      } catch (testError) {
        console.error('❌ JwtService test failed:', testError.message);
      }
    } else {
      console.error('❌ CRITICAL: JwtService is not injected!');
      console.error('🔍 this.jwtService:', this.jwtService);
      console.error('🔍 typeof this.jwtService:', typeof this.jwtService);
    }
    
    // 🔧 ENVIRONMENT CHECK
    console.log('🔧 Environment variables:');
    console.log('🔧 - NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 - JWT_SECRET available:', !!process.env.JWT_SECRET);
    console.log('🔧 - JWT_SECRET length:', process.env.JWT_SECRET?.length);
    console.log('🔧 - JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
  }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.logger.log(`🔍 Validating user with email: ${email?.substring(0, 3)}***`);
      
      // 🔧 STEP 1: Input validation
      if (!email || !password) {
        this.logger.warn('❌ Email or password missing');
        return null;
      }
      this.logger.log('✅ STEP 1: Email and password provided');

      // 🔧 STEP 2: Find user by email
      this.logger.log('📧 STEP 2: Looking up user by email...');
      this.logger.log(`🔍 Email to lookup: ${email}`);
      
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        this.logger.warn(`❌ STEP 2: User not found with email: ${email?.substring(0, 3)}***`);
        return null;
      }
      
      this.logger.log('👤 STEP 2: User found successfully');
      this.logger.log(`🔍 User details: ID=${user.id}, Email=${user.email}`);
      this.logger.log(`🔍 User has password hash: ${!!user.password}`);
      this.logger.log(`🔍 Password hash length: ${user.password?.length}`);

      // 🔧 STEP 3: Verify password
      this.logger.log('🔐 STEP 3: Verifying password...');
      this.logger.log(`🔍 Input password length: ${password?.length}`);
      this.logger.log(`🔍 Stored hash length: ${user.password?.length}`);
      
      let isPasswordValid: boolean;
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
        this.logger.log(`🔍 Password comparison result: ${isPasswordValid}`);
      } catch (bcryptError) {
        this.logger.error('❌ Password comparison failed:', {
          message: bcryptError.message,
          stack: bcryptError.stack
        });
        return null;
      }
      
      if (!isPasswordValid) {
        this.logger.warn('❌ STEP 3: Invalid password provided');
        this.logger.log('🔍 Note: Password comparison returned false');
        return null;
      }

      this.logger.log('✅ STEP 3: Password validation successful');
      
      // 🔧 STEP 4: Return user without password
      this.logger.log('🔍 STEP 4: Preparing user response...');
      const { password: _, ...result } = user;
      this.logger.log(`✅ STEP 4: User validation completed for ID: ${result.id}`);
      
      return result;
      
    } catch (error) {
      this.logger.error('❌ Error in validateUser - COMPREHENSIVE:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        email: email?.substring(0, 3) + '***'
      });
      return null;
    }
  }

  async login(user: any) {
    try {
      this.logger.log(`🔐 Creating JWT token for user: ${user.email?.substring(0, 3)}***`);
      
      // 🔧 CRITICAL PRE-CHECKS
      if (!this.jwtService) {
        this.logger.error('❌ FATAL: JwtService is null/undefined in login method!');
        this.logger.error('🔍 this.jwtService:', this.jwtService);
        this.logger.error('🔍 constructor name:', this.jwtService?.constructor?.name);
        
        // 🔧 EMERGENCY: Try direct import as fallback
        try {
          const jwt = require('jsonwebtoken');
          const secret = process.env.JWT_SECRET || 'fallback-jwt-secret-for-development-minimum-32-chars';
          const payload = { email: user.email, sub: user.id, iat: Math.floor(Date.now() / 1000) };
          const token = jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
          
          this.logger.warn('🔧 EMERGENCY: Used direct jsonwebtoken as fallback');
          
          return {
            accessToken: token,
            user: {
              id: user.id,
              email: user.email,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              createdAt: user.createdAt,
              updatedAt: user.updatedAt
            },
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          };
        } catch (fallbackError) {
          this.logger.error('❌ Fallback JWT signing also failed:', fallbackError.message);
          throw new Error('JWT service completely unavailable - both NestJS and direct jsonwebtoken failed');
        }
      }
      
      // 🔧 METHOD CHECK
      if (typeof this.jwtService.sign !== 'function') {
        this.logger.error('❌ CRITICAL: JwtService.sign method is not a function!');
        this.logger.error('🔍 JwtService type:', typeof this.jwtService);
        this.logger.error('🔍 JwtService methods:', Object.getOwnPropertyNames(this.jwtService));
        this.logger.error('🔍 JwtService prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.jwtService)));
        throw new Error('JwtService.sign method is not available - service corrupted');
      }
      
      // 🔧 USER CHECK
      if (!user || !user.id || !user.email) {
        this.logger.error('❌ Invalid user object provided to login method');
        this.logger.error('🔍 User object:', {
          hasUser: !!user,
          hasId: !!user?.id,
          hasEmail: !!user?.email,
          userKeys: user ? Object.keys(user) : 'N/A'
        });
        throw new Error('Invalid user object provided to login method');
      }

      // 🔧 CREATE PAYLOAD
      const payload = { 
        email: user.email, 
        sub: user.id,
        iat: Math.floor(Date.now() / 1000)
      };
      
      this.logger.log('📝 JWT payload created, signing token...');
      this.logger.log('🔍 JWT payload:', payload);
      
      // 🔧 SIGN TOKEN
      let accessToken: string;
      try {
        this.logger.log('🔍 About to call this.jwtService.sign...');
        accessToken = this.jwtService.sign(payload);
        this.logger.log('✅ JWT token created successfully');
        this.logger.log('🔍 Access token length:', accessToken?.length);
      } catch (signError) {
        this.logger.error('❌ CRITICAL: JwtService.sign() failed:', {
          message: signError.message,
          stack: signError.stack,
          payload: payload,
          jwtServiceType: typeof this.jwtService,
          jwtServiceConstructor: this.jwtService?.constructor?.name
        });
        throw new Error(`JWT signing failed: ${signError.message}`);
      }
      
      // 🔧 BUILD RESPONSE
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || user.email.split('@')[0];
      
      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: fullName,
          firstName: firstName,
          lastName: lastName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
      
    } catch (error) {
      this.logger.error('❌ Error in login - FINAL CATCH:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        userId: user?.id,
        userFields: Object.keys(user || {}),
        hasJwtService: !!this.jwtService,
        jwtServiceType: this.jwtService ? this.jwtService.constructor.name : 'undefined',
        jwtServiceMethods: this.jwtService ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.jwtService)) : 'N/A'
      });
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      this.logger.log(`📝 Registering new user with email: ${registerDto.email?.substring(0, 3)}***`);
      
      // 🔧 RUNTIME CHECK per UsersService
      if (!this.usersService) {
        this.logger.error('❌ CRITICAL: UsersService is not injected!');
        this.logger.error('🔍 this.usersService:', this.usersService);
        this.logger.error('🔍 typeof this.usersService:', typeof this.usersService);
        throw new Error('UsersService dependency injection failed');
      }
      
      if (typeof this.usersService.findByEmail !== 'function') {
        this.logger.error('❌ CRITICAL: UsersService.findByEmail method is not available!');
        this.logger.error('🔍 UsersService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.usersService)));
        throw new Error('UsersService.findByEmail method is not available');
      }
      
      // STEP 1: Check if user already exists
      this.logger.log('🔍 STEP 1: Checking if user already exists...');
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        this.logger.warn(`❌ User already exists with email: ${registerDto.email?.substring(0, 3)}***`);
        throw new Error('User with this email already exists');
      }
      this.logger.log('✅ STEP 1: Email is available');

      // STEP 2: Create user via UsersService
      this.logger.log('🔍 STEP 2: Creating user via UsersService...');
      this.logger.log('🔍 User data being passed:', {
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        hasPassword: !!registerDto.password
      });
      
      const user = await this.usersService.create(registerDto);
      this.logger.log(`✅ STEP 2: User created successfully with ID: ${user.id}`);
      
      // STEP 3: Return user data
      this.logger.log('🔍 STEP 3: Preparing response...');
      const response = {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        createdAt: user.createdAt
      };
      
      this.logger.log('✅ STEP 3: Registration completed successfully');
      return response;
      
    } catch (error) {
      this.logger.error('❌ Error in register - COMPREHENSIVE DETAILS:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
        email: registerDto.email?.substring(0, 3) + '***',
        step: 'Determining step from error...',
        registerDto: {
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          hasPassword: !!registerDto.password
        }
      });
      
      // Analizza l'errore per determinare il tipo
      if (error.message?.includes('already exists')) {
        this.logger.error('🏷️ Error Type: USER_ALREADY_EXISTS');
      } else if (error.message?.includes('validation') || error.message?.includes('required')) {
        this.logger.error('🏷️ Error Type: VALIDATION_ERROR');
      } else if (error.message?.includes('database') || error.message?.includes('connection')) {
        this.logger.error('🏷️ Error Type: DATABASE_ERROR');
      } else if (error.message?.includes('bcrypt') || error.message?.includes('hash')) {
        this.logger.error('🏷️ Error Type: PASSWORD_HASHING_ERROR');
      } else {
        this.logger.error('🏷️ Error Type: UNKNOWN_ERROR');
      }
      
      throw error;
    }
  }
}