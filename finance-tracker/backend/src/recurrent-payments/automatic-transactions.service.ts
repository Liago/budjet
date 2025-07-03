import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NotificationsService } from "../notifications/notifications.service";
import { TransactionType } from "../common/constants";
import { EmailService } from "../email/email.service";

export interface ExecutionResult {
  processedPayments: number;
  createdTransactions: number;
  totalAmount: number;
  executionDate: Date;
  details: {
    paymentName: string;
    amount: number;
    nextDate: Date;
  }[];
}

@Injectable()
export class AutomaticTransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRecurrentPayments(): Promise<ExecutionResult> {
    console.log(
      "🔄 [AutomaticTransactionsService] Cron job triggered at:",
      new Date().toISOString()
    );
    const result = await this.processRecurrentPayments();
    console.log(
      "✅ [AutomaticTransactionsService] Cron job completed:",
      result
    );
    return result;
  }

  async manualExecution(): Promise<ExecutionResult> {
    return this.processRecurrentPayments();
  }

  private async processRecurrentPayments(): Promise<ExecutionResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(
      "🔄 [AutomaticTransactionsService] Processing recurrent payments for date:",
      today.toISOString()
    );

    const result: ExecutionResult = {
      processedPayments: 0,
      createdTransactions: 0,
      totalAmount: 0,
      executionDate: new Date(),
      details: [],
    };

    // First, let's check all recurrent payments to debug
    const allPayments = await this.prisma.recurrentPayment.findMany({
      include: {
        category: true,
        user: true,
      },
    });

    console.log(
      "🔍 [AutomaticTransactionsService] All recurrent payments in database:",
      allPayments.map((p) => ({
        id: p.id,
        name: p.name,
        amount: p.amount,
        isActive: p.isActive,
        nextPaymentDate: p.nextPaymentDate,
        interval: p.interval,
      }))
    );

    // Find all active recurrent payments that are due today
    const duePayments = await this.prisma.recurrentPayment.findMany({
      where: {
        isActive: true,
        nextPaymentDate: {
          lte: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Include payments due until the end of today
        },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: {
        category: true,
        user: true,
      },
    });

    console.log(
      "🎯 [AutomaticTransactionsService] Due payments found:",
      duePayments.map((p) => ({
        id: p.id,
        name: p.name,
        amount: p.amount,
        nextPaymentDate: p.nextPaymentDate,
        interval: p.interval,
      }))
    );

    result.processedPayments = duePayments.length;

    // Group payments by user
    const userPayments = new Map<
      string,
      {
        email: string;
        payments: typeof duePayments;
      }
    >();

    for (const payment of duePayments) {
      if (!userPayments.has(payment.userId)) {
        userPayments.set(payment.userId, {
          email: payment.user.email,
          payments: [],
        });
      }
      userPayments.get(payment.userId).payments.push(payment);
    }

    // Create execution log first
    const executionLog = await this.prisma.automaticExecutionLog.create({
      data: {
        executionDate: result.executionDate,
        processedPayments: result.processedPayments,
        createdTransactions: 0, // Will be updated later
        totalAmount: 0, // Will be updated later
        details: "[]", // Will be updated later
      },
    });

    // Process payments for each user
    for (const [userId, { email, payments }] of userPayments.entries()) {
      let userTotalAmount = 0;
      const userTransactions = [];

      // Create transactions for each payment
      for (const payment of payments) {
        const transaction = await this.prisma.transaction.create({
          data: {
            amount: payment.amount,
            description: `${payment.name} - Pagamento automatico`,
            date: today,
            type: TransactionType.EXPENSE,
            category: {
              connect: { id: payment.categoryId },
            },
            user: {
              connect: { id: payment.userId },
            },
            executionLog: {
              connect: { id: executionLog.id },
            },
          },
        });

        const nextDate = this.calculateNextPaymentDate(
          payment.nextPaymentDate,
          payment.interval,
          payment.dayOfMonth,
          payment.dayOfWeek
        );

        // Update the next payment date
        await this.updateNextPaymentDate(payment.id, nextDate);

        // Add to result details
        const transactionDetails = {
          paymentName: payment.name,
          amount: Number(payment.amount),
          nextDate,
        };
        result.details.push(transactionDetails);
        userTransactions.push(transactionDetails);

        userTotalAmount += Number(payment.amount);
        result.createdTransactions++;
        result.totalAmount += Number(payment.amount);

        // Controlla se l'utente vuole ricevere notifiche in-app di questo tipo
        const shouldSendAppNotification =
          await this.notificationsService.shouldSendNotification(
            payment.userId,
            "PAYMENT_REMINDER",
            "app"
          );

        // Create notification for the user if allowed
        if (shouldSendAppNotification) {
          await this.notificationsService.create(payment.userId, {
            title: "Transazione Automatica Creata",
            message: `È stata creata una nuova transazione di ${
              payment.amount
            }€ per il pagamento ricorrente "${
              payment.name
            }". Prossimo pagamento: ${nextDate.toLocaleDateString()}`,
            type: "info",
          });
        }
      }

      // Controlla se l'utente vuole ricevere email di questo tipo
      const shouldSendEmailNotification =
        await this.notificationsService.shouldSendNotification(
          userId,
          "PAYMENT_REMINDER",
          "email"
        );

      // Send email to the user if allowed
      if (userTransactions.length > 0 && shouldSendEmailNotification) {
        await this.emailService.sendRecurrentPaymentsNotification(
          email,
          userTransactions,
          userTotalAmount
        );
      }
    }

    // Update execution log with final results
    if (result.processedPayments > 0) {
      await this.prisma.automaticExecutionLog.update({
        where: { id: executionLog.id },
        data: {
          createdTransactions: result.createdTransactions,
          totalAmount: result.totalAmount,
          details: JSON.stringify(result.details),
        },
      });
    }

    return result;
  }

  async getLastExecutionLog(userId: string): Promise<ExecutionResult | null> {
    const log = await this.prisma.automaticExecutionLog.findFirst({
      where: {
        transactions: {
          some: {
            userId: userId,
          },
        },
      },
      orderBy: {
        executionDate: "desc",
      },
    });

    if (!log) {
      return null;
    }

    return {
      processedPayments: log.processedPayments,
      createdTransactions: log.createdTransactions,
      totalAmount: Number(log.totalAmount),
      executionDate: log.executionDate,
      details: JSON.parse(log.details),
    };
  }

  private async updateNextPaymentDate(paymentId: string, nextDate: Date) {
    await this.prisma.recurrentPayment.update({
      where: { id: paymentId },
      data: { nextPaymentDate: nextDate },
    });
  }

  private calculateNextPaymentDate(
    currentDate: Date,
    interval: string,
    dayOfMonth?: number,
    dayOfWeek?: number
  ): Date {
    const nextDate = new Date(currentDate);

    switch (interval) {
      case "daily":
        nextDate.setDate(nextDate.getDate() + 1);
        break;

      case "weekly":
        if (dayOfWeek !== undefined) {
          const currentDayOfWeek = nextDate.getDay();
          let daysToAdd = dayOfWeek - currentDayOfWeek;
          if (daysToAdd <= 0) {
            daysToAdd += 7;
          }
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        } else {
          nextDate.setDate(nextDate.getDate() + 7);
        }
        break;

      case "monthly":
        if (dayOfMonth !== undefined) {
          nextDate.setMonth(nextDate.getMonth() + 1);
          nextDate.setDate(dayOfMonth);
        } else {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        break;

      case "yearly":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;

      default:
        break;
    }

    return nextDate;
  }
}
