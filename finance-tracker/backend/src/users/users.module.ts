import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 🔧 FIX: Aggiunto

@Module({
  imports: [PrismaModule], // 🔧 FIX: Aggiunto PrismaModule
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}