import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 🔧 FIX: Aggiunto

@Module({
  imports: [PrismaModule], // 🔧 FIX: Aggiunto PrismaModule
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}