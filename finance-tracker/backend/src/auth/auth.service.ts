import { Injectable, Logger, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(UsersService) private usersService: UsersService,
    private jwtService: JwtService
  ) {
    console.log('🔧 AuthService initialized, usersService:', !!this.usersService);
    console.log('🔧 UsersService type:', this.usersService ? this.usersService.constructor.name : 'undefined');
    console.log('🔧 UsersService methods:', this.usersService ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.usersService)) : 'N/A');
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
      
      if (!user || !user.id || !user.email) {
        throw new Error('Invalid user object provided to login method');
      }

      const payload = { 
        email: user.email, 
        sub: user.id,
        iat: Math.floor(Date.now() / 1000) // issued at timestamp
      };
      
      this.logger.log('📝 JWT payload created, signing token...');
      const accessToken = this.jwtService.sign(payload);
      
      this.logger.log('✅ JWT token created successfully');
      
      // 🔧 FIX: Controlla se i campi firstName/lastName esistono
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || user.email.split('@')[0];
      
      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: fullName, // 🔧 Usa il nome costruito in modo sicuro
          firstName: firstName,
          lastName: lastName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      };
      
    } catch (error) {
      this.logger.error('❌ Error in login:', {
        message: error.message,
        stack: error.stack,
        userId: user?.id,
        userFields: Object.keys(user || {}) // 🔧 Log dei campi disponibili per debug
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
