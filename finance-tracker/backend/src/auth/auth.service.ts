import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {
    console.log('🔧 AuthService initialized');
    console.log('🔧 - usersService available:', !!this.usersService);
    console.log('🔧 - jwtService available:', !!this.jwtService);
    console.log('🔧 - JWT_SECRET available:', !!process.env.JWT_SECRET);
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
      
      // Simple validation
      if (!user || !user.id || !user.email) {
        throw new Error('Invalid user object provided');
      }

      // Create JWT payload
      const payload = { 
        email: user.email, 
        sub: user.id
      };
      
      // Sign token
      const access_token = this.jwtService.sign(payload);
      
      this.logger.log('✅ JWT token created successfully');
      
      return {
        accessToken: access_token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        }
      };
      
    } catch (error) {
      this.logger.error('❌ Error in login:', error.message);
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      this.logger.log(`📝 Registering new user with email: ${registerDto.email?.substring(0, 3)}***`);
      
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user via UsersService
      const user = await this.usersService.create(registerDto);
      this.logger.log(`✅ User created successfully with ID: ${user.id}`);
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
      
    } catch (error) {
      this.logger.error('❌ Error in register:', error.message);
      throw error;
    }
  }
}