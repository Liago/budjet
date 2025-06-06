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
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      this.logger.log(`🔍 Validating user with email: ${email?.substring(0, 3)}***`);
      
      if (!email || !password) {
        this.logger.warn('❌ Email or password missing');
        return null;
      }

      // Find user by email
      this.logger.log('📧 Looking up user by email...');
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        this.logger.warn(`❌ User not found with email: ${email?.substring(0, 3)}***`);
        return null;
      }

      this.logger.log('👤 User found, verifying password...');
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        this.logger.warn('❌ Invalid password provided');
        return null;
      }

      this.logger.log('✅ Password validation successful');
      
      // Return user without password
      const { password: _, ...result } = user;
      return result;
      
    } catch (error) {
      this.logger.error('❌ Error in validateUser:', {
        message: error.message,
        stack: error.stack,
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
      
      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      };
      
    } catch (error) {
      this.logger.error('❌ Error in login:', {
        message: error.message,
        stack: error.stack,
        userId: user?.id
      });
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      this.logger.log(`📝 Registering new user with email: ${registerDto.email?.substring(0, 3)}***`);
      
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        this.logger.warn(`❌ User already exists with email: ${registerDto.email?.substring(0, 3)}***`);
        throw new Error('User with this email already exists');
      }

      const user = await this.usersService.create(registerDto);
      this.logger.log(`✅ User registered successfully with ID: ${user.id}`);
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      };
      
    } catch (error) {
      this.logger.error('❌ Error in register:', {
        message: error.message,
        stack: error.stack,
        email: registerDto.email?.substring(0, 3) + '***'
      });
      throw error;
    }
  }
}
