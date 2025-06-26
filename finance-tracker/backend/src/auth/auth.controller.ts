import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

// 🔧 TEMPORARY IMPORT FOR DIRECT LOGIN
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService // 🔧 DIRECT ACCESS TO PRISMA
  ) {
    console.log(
      "🔧 AuthController initialized, authService:",
      !!this.authService
    );
    console.log("🔧 AuthController initialized, prisma:", !!this.prisma);
  }

  @Post("direct-login")
  @ApiOperation({
    summary: "Direct login bypassing dependency injection issues",
  })
  async directLogin(@Body() loginDto: LoginDto) {
    console.log("🔧 DIRECT-LOGIN endpoint called:", {
      email: loginDto.email,
      hasPassword: !!loginDto.password,
    });

    try {
      // Direct database access
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        console.log("❌ User not found");
        return {
          success: false,
          message: "Invalid email or password",
          statusCode: 401,
        };
      }

      // Direct password verification
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password
      );

      if (!isPasswordValid) {
        console.log("❌ Invalid password");
        return {
          success: false,
          message: "Invalid email or password",
          statusCode: 401,
        };
      }

      // Direct JWT generation
      const jwtSecret =
        process.env.JWT_SECRET ||
        "fallback-jwt-secret-for-development-minimum-32-chars";
      const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        jwtSecret,
        { expiresIn: "24h" }
      );

      console.log("✅ DIRECT-LOGIN successful");

      return {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      console.error("❌ DIRECT-LOGIN failed:", error.message);
      return {
        success: false,
        message: "Internal server error",
        statusCode: 500,
        error: error.message,
      };
    }
  }

  @Post("test-login")
  @ApiOperation({ summary: "Test login without guards" })
  async testLogin(@Body() loginDto: LoginDto) {
    console.log("🧪 TEST-LOGIN endpoint called (no guards):", {
      email: loginDto.email,
      hasPassword: !!loginDto.password,
      passwordLength: loginDto.password?.length,
    });

    try {
      console.log("🧪 Calling AuthService.validateUser directly...");
      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password
      );

      if (!user) {
        console.log("❌ TEST-LOGIN: User validation failed");
        return {
          success: false,
          message: "Invalid credentials",
          step: "validateUser returned null",
        };
      }

      console.log("✅ TEST-LOGIN: User validated, generating JWT...");
      const result = await this.authService.login(user);

      console.log("✅ TEST-LOGIN: Complete success!");
      return {
        success: true,
        message: "Login successful",
        data: result,
      };
    } catch (error) {
      console.error("❌ TEST-LOGIN failed:", {
        message: error.message,
        stack: error.stack,
      });

      return {
        success: false,
        message: error.message,
        step: "Exception thrown",
        error: error.name,
      };
    }
  }

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 409, description: "Email already in use" })
  async register(@Body() registerDto: RegisterDto) {
    console.log("📝 Register endpoint called for:", registerDto.email);

    try {
      const result = await this.authService.register(registerDto);
      console.log("✅ Registration successful for user:", result.id);
      return result;
    } catch (error) {
      console.error("❌ Registration failed:", error.message);
      throw error;
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 200, description: "User successfully logged in" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    console.log("🔐 Login endpoint called for:", loginDto.email);

    try {
      const result = await this.authService.login(req.user);
      console.log("✅ Login successful, JWT generated");
      return result;
    } catch (error) {
      console.error("❌ Login failed:", error.message);
      throw error;
    }
  }
}
