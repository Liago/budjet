import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma/prisma.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { CategoriesModule } from "./categories/categories.module";
import { TagsModule } from "./tags/tags.module";
import { ReportsModule } from "./reports/reports.module";
import { PrismaModule } from "./prisma/prisma.module";
import { DatabaseModule } from "./database/database.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { RecurrentPaymentsModule } from "./recurrent-payments/recurrent-payments.module";
import { SavingsGoalsModule } from "./savings-goals/savings-goals.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { EmailModule } from "./email/email.module";

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
    SavingsGoalsModule,
    NotificationsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
