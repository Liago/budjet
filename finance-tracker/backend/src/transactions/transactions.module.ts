import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 🔧 FIX: Aggiunto
import { CategoriesModule } from '../categories/categories.module'; // 🔧 FIX: Aggiunto se necessario

@Module({
  imports: [PrismaModule, CategoriesModule], // 🔧 FIX: Aggiunto dependencies
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}