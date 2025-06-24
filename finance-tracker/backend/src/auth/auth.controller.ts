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

  @Post('test-login')
  @ApiOperation({ summary: 'Test login without guards' })
  async testLogin(@Body() loginDto: LoginDto) {
    console.log('🧪 TEST-LOGIN endpoint called (no guards):', {
      email: loginDto.email,
      hasPassword: !!loginDto.password,
      passwordLength: loginDto.password?.length
    });
    
    try {
      console.log('🧪 Calling AuthService.validateUser directly...');
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      
      if (!user) {
        console.log('❌ TEST-LOGIN: User validation failed');
        return {
          success: false,
          message: 'Invalid credentials',
          step: 'validateUser returned null'
        };
      }
      
      console.log('✅ TEST-LOGIN: User validated, generating JWT...');
      const result = await this.authService.login(user);
      
      console.log('✅ TEST-LOGIN: Complete success!');
      return {
        success: true,
        message: 'Login successful',
        data: result
      };
      
    } catch (error) {
      console.error('❌ TEST-LOGIN failed:', {
        message: error.message,
        stack: error.stack
      });
      
      return {
        success: false,
        message: error.message,
        step: 'Exception thrown',
        error: error.name
      };
    }
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
    console.log('🔐 LOGIN endpoint called with data:', {
      email: loginDto.email,
      hasPassword: !!loginDto.password,
      passwordLength: loginDto.password?.length
    });
    
    console.log('🔍 Request user from LocalAuthGuard:', {
      hasUser: !!req.user,
      userId: req.user?.id,
      userEmail: req.user?.email
    });
    
    try {
      console.log('🔍 Calling AuthService.login...');
      const result = await this.authService.login(req.user);
      console.log('✅ Login successful, JWT generated');
      return result;
      
    } catch (error) {
      console.error('❌ Login failed in controller:', {
        message: error.message,
        stack: error.stack,
        hasUser: !!req.user,
        userId: req.user?.id
      });
      throw error;
    }
  }
} 