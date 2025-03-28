import { Module } from "@nestjs/common";
import { RecurrentPaymentsController } from "./recurrent-payments.controller";
import { RecurrentPaymentsService } from "./recurrent-payments.service";
import { PrismaModule } from "../prisma/prisma.module";
import { ScheduleModule } from "@nestjs/schedule";
import { AutomaticTransactionsService } from "./automatic-transactions.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    NotificationsModule,
    EmailModule,
  ],
  controllers: [RecurrentPaymentsController],
  providers: [RecurrentPaymentsService, AutomaticTransactionsService],
  exports: [RecurrentPaymentsService],
})
export class RecurrentPaymentsModule {}
