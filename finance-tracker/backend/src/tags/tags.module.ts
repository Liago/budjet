import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 🔧 FIX: Aggiunto

@Module({
  imports: [PrismaModule], // 🔧 FIX: Aggiunto PrismaModule
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}