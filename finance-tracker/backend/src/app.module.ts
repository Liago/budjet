import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseModule } from './database/database.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { RecurrentPaymentsModule } from './recurrent-payments/recurrent-payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    CategoriesModule,
    TagsModule,
    ReportsModule,
    DashboardModule,
    RecurrentPaymentsModule,
  ],
})
export class AppModule {} 