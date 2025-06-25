import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

// 🔧 FIX: Accesso diretto sicuro alle variabili d'ambiente
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'fallback-jwt-secret-for-development-minimum-32-chars';
  console.log('🔧 AuthModule JWT Secret check:', {
    available: !!secret,
    length: secret?.length,
    environment: process.env.NODE_ENV
  });
  return secret;
};

const getJwtExpiresIn = () => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  console.log('🔧 AuthModule JWT ExpiresIn:', expiresIn);
  return expiresIn;
};

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: {
        expiresIn: getJwtExpiresIn(),
      },
      global: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    LocalStrategy
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {
  constructor() {
    console.log('🔧 AuthModule constructor - Final check');
    console.log('🔧 - Environment:', process.env.NODE_ENV);
    console.log('🔧 - JWT_SECRET available:', !!process.env.JWT_SECRET);
  }
}