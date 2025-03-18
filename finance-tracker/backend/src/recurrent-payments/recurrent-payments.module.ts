import { Module } from '@nestjs/common';
import { RecurrentPaymentsController } from './recurrent-payments.controller';
import { RecurrentPaymentsService } from './recurrent-payments.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RecurrentPaymentsController],
  providers: [RecurrentPaymentsService],
  exports: [RecurrentPaymentsService],
})
export class RecurrentPaymentsModule {} 