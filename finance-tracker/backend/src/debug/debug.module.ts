import { Module } from '@nestjs/common';
import { DebugController } from './debug.controller';

@Module({
  controllers: [DebugController],
  // Volutamente NON importiamo PrismaModule per testare solo l'autenticazione
})
export class DebugModule {}
