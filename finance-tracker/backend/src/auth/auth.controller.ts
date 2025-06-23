import { Controller, Post, Body, UseGuards, Request, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService
  ) {
    console.log('🔧 AuthController initialized, authService:', !!this.authService);
    console.log('🔧 AuthService type:', this.authService ? this.authService.constructor.name : 'undefined');
    console.log('🔧 AuthService methods:', this.authService ? Object.getOwnPropertyNames(Object.getPrototypeOf(this.authService)) : 'N/A');
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() registerDto: RegisterDto) {
    console.log('📝 REGISTER endpoint called with data:', {
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      hasPassword: !!registerDto.password,
      passwordLength: registerDto.password?.length
    });
    
    // 🔧 RUNTIME CHECK per AuthService
    if (!this.authService) {
      console.error('❌ CRITICAL: AuthService is not injected!');
      console.error('🔍 this.authService:', this.authService);
      console.error('🔍 typeof this.authService:', typeof this.authService);
      throw new Error('AuthService dependency injection failed');
    }
    
    if (typeof this.authService.register !== 'function') {
      console.error('❌ CRITICAL: AuthService.register method is not available!');
      console.error('🔍 AuthService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.authService)));
      throw new Error('AuthService.register method is not available');
    }
    
    try {
      console.log('📝 Calling AuthService.register...');
      const result = await this.authService.register(registerDto);
      console.log('✅ Registration successful for user:', result.id);
      return result;
      
    } catch (error) {
      console.error('❌ Registration failed - DETAILED ERROR:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
        registerDto: {
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName
        }
      });
      
      // Re-throw per permettere a NestJS di gestire l'errore
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user);
  }
} 