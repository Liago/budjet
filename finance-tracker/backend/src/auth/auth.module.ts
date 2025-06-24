import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // 🔧 FIX: Configurazione ASINCRONA di JwtModule con ConfigService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET') || 'fallback-jwt-secret-for-development-minimum-32-chars';
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '7d';
        
        // 🔧 LOGGING per debug
        console.log('🔧 JWT Configuration:');
        console.log('🔧 - JWT_SECRET available:', !!secret);
        console.log('🔧 - JWT_SECRET length:', secret?.length);
        console.log('🔧 - JWT_EXPIRES_IN:', expiresIn);
        console.log('🔧 - Environment:', process.env.NODE_ENV);
        
        return {
          secret: secret,
          signOptions: {
            expiresIn: expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService, JwtModule], // 🔧 AGGIUNTO: Esporta anche JwtModule per altri moduli
})
export class AuthModule {}