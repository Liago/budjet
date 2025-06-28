import { Controller, Get, UseGuards, Post, Body } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("debug")
@Controller("debug")
export class DebugController {
  // Endpoint NON protetto per test di base
  @Get("health")
  getHealth() {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      message: "Debug controller is working",
      nestjsApp: "initialized",
      environment: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
    };
  }

  // Endpoint protetto SENZA PrismaService per testare solo JWT
  @Get("auth-test")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAuthTest() {
    return {
      status: "OK",
      timestamp: new Date().toISOString(),
      message: "JWT authentication is working",
      authenticated: true,
    };
  }

  // Endpoint che testa il problema specifico
  @Get("minimal")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMinimalTest() {
    try {
      return {
        status: "OK",
        timestamp: new Date().toISOString(),
        message: "Minimal protected endpoint working",
      };
    } catch (error) {
      return {
        status: "ERROR",
        error: error.message,
        stack: error.stack,
      };
    }
  }

  // 🔧 NUOVO: Test diretto del database per verificare users
  @Get("test-users")
  async testUsers() {
    try {
      const { PrismaService } = await import("../prisma/prisma.service");
      const prisma = new PrismaService();

      // Test 1: Connessione database
      await prisma.$connect();

      // Test 2: Count utenti
      const userCount = await prisma.user.count();

      // Test 3: Primi 3 utenti (senza password)
      const users = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });

      await prisma.$disconnect();

      return {
        status: "OK",
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          userCount,
          sampleUsers: users,
        },
      };
    } catch (error) {
      return {
        status: "ERROR",
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🔧 NUOVO: Test login diretto per debuggare il 401
  @Post("test-login")
  async testLogin(@Body() body: { email: string; password: string }) {
    try {
      const { PrismaService } = await import("../prisma/prisma.service");
      const bcrypt = await import("bcryptjs");
      const jwt = await import("jsonwebtoken");

      const prisma = new PrismaService();
      await prisma.$connect();

      console.log("🔧 Debug login test:", {
        email: body.email,
        hasPassword: !!body.password,
        passwordLength: body.password?.length,
      });

      // Step 1: Find user
      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user) {
        await prisma.$disconnect();
        return {
          status: "DEBUG",
          step: 1,
          result: "USER_NOT_FOUND",
          email: body.email,
          timestamp: new Date().toISOString(),
        };
      }

      // Step 2: Test password
      const isPasswordValid = await bcrypt.compare(
        body.password,
        user.password
      );

      if (!isPasswordValid) {
        await prisma.$disconnect();
        return {
          status: "DEBUG",
          step: 2,
          result: "INVALID_PASSWORD",
          email: body.email,
          passwordHash: user.password.substring(0, 20) + "...",
          timestamp: new Date().toISOString(),
        };
      }

      // Step 3: Generate JWT
      const jwtSecret = process.env.JWT_SECRET;
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

      await prisma.$disconnect();

      return {
        status: "SUCCESS",
        message: "Debug login successful",
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "ERROR",
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
