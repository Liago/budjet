import { Controller, Post, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {
    console.log('🔧 AuthController initialized, authService:', !!this.authService);
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
    console.log('📝 Register endpoint called for:', registerDto.email);
    
    try {
      const result = await this.authService.register(registerDto);
      console.log('✅ Registration successful for user:', result.id);
      return result;
      
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    console.log('🔐 Login endpoint called for:', loginDto.email);
    
    try {
      const result = await this.authService.login(req.user);
      console.log('✅ Login successful, JWT generated');
      return result;
      
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  }
} 