import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

// Interface for execution result
interface ExecutionResult {
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

@ApiTags("direct")
@Controller("direct")
export class DirectController {
  // 🚀 DEBUG ENDPOINT - Temporary for debugging
  @Get("debug-data")
  async getDebugData() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get sample transactions with amounts
      const transactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: { date: "desc" },
        include: { category: true },
      });

      // Get amount statistics
      const [positiveCount, negativeCount, totalCount] = await Promise.all([
        prisma.transaction.count({ where: { amount: { gt: 0 } } }),
        prisma.transaction.count({ where: { amount: { lt: 0 } } }),
        prisma.transaction.count(),
      ]);

      await prisma.$disconnect();

      return {
        sampleTransactions: transactions,
        stats: {
          totalTransactions: totalCount,
          positiveAmounts: positiveCount,
          negativeAmounts: negativeCount,
        },
        analysis: {
          issue:
            "If negativeAmounts = 0, then all expenses are saved as positive values",
        },
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // 🚀 CATEGORIES - Direct endpoint
  @Get("categories")
  async getCategories() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { transactions: true },
          },
        },
      });

      await prisma.$disconnect();

      return categories;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 TRANSACTIONS - Direct endpoint
  @Get("transactions")
  async getTransactions(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("categoryId") categoryId?: string,
    @Query("page") page = "1",
    @Query("limit") limit = "50"
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = {};
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Add category filter
      if (categoryId && categoryId !== "all") {
        where.categoryId = categoryId;
      }

      // Get transactions with relations
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            category: true,
            tags: true,
          },
          orderBy: { date: "desc" },
          skip,
          take: limitNum,
        }),
        prisma.transaction.count({ where }),
      ]);

      await prisma.$disconnect();

      return {
        data: transactions,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 CATEGORY SPENDING STATS - Direct endpoint
  @Get("category-spending")
  async getCategorySpending(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Default to current month if no dates provided
      const start = startDate
        ? new Date(startDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate
        ? new Date(endDate)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      // Get spending by category
      const categorySpending = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          date: { gte: start, lte: end },
          type: "EXPENSE",
        },
        _sum: { amount: true },
        _count: { id: true },
      });

      // Get category details
      const categoriesData = await Promise.all(
        categorySpending.map(async (item) => {
          const category = await prisma.category.findUnique({
            where: { id: item.categoryId },
            select: { id: true, name: true, color: true, budget: true },
          });

          return {
            categoryId: item.categoryId,
            categoryName: category?.name || "Unknown",
            color: category?.color || "#999999",
            budget: Number(category?.budget || 0),
            spent: Number(item._sum.amount || 0),
            transactionCount: item._count.id,
          };
        })
      );

      await prisma.$disconnect();
      return categoriesData.sort((a, b) => b.spent - a.spent);
    } catch (error) {
      return { error: error.message };
    }
  }

  // 🚀 RECENT TRANSACTIONS - Direct endpoint
  @Get("recent-transactions")
  async getRecentTransactions(@Query("limit") limit = "5") {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const transactions = await prisma.transaction.findMany({
        take: parseInt(limit),
        orderBy: { date: "desc" },
        include: { category: true },
      });

      await prisma.$disconnect();
      return transactions;
    } catch (error) {
      return { error: error.message };
    }
  }

  // 🚀 DASHBOARD STATS - Direct endpoint
  @Get("stats")
  async getDashboardStats(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Default to current month if no dates provided
      const start = startDate
        ? new Date(startDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate
        ? new Date(endDate)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      // Get basic stats using transaction TYPE instead of amount sign
      const [transactions, income, expenses] = await Promise.all([
        prisma.transaction.count({
          where: {
            date: { gte: start, lte: end },
          },
        }),
        prisma.transaction.aggregate({
          where: {
            date: { gte: start, lte: end },
            type: "INCOME",
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            date: { gte: start, lte: end },
            type: "EXPENSE",
          },
          _sum: { amount: true },
        }),
      ]);

      // Calculate balance (all amounts are positive, so expenses are subtracted)
      const totalIncome = Number(income._sum.amount || 0);
      const totalExpenses = Number(expenses._sum.amount || 0);
      const balance = totalIncome - totalExpenses;

      await prisma.$disconnect();

      return {
        totalTransactions: transactions,
        totalIncome,
        totalExpenses,
        balance,
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 NOTIFICATIONS - Direct endpoint (placeholder)
  @Get("notifications")
  async getNotifications() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const notifications = await prisma.notification.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      await prisma.$disconnect();

      return notifications;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 NOTIFICATIONS COUNT - Direct endpoint
  @Get("notifications/unread/count")
  async getUnreadNotificationsCount() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const count = await prisma.notification.count({
        where: { isRead: false },
      });

      await prisma.$disconnect();

      return { count };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 NOTIFICATION MARK AS READ - Direct endpoint
  @Patch("notifications/:id/read")
  async markNotificationAsRead(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Update notification to mark as read
      const updatedNotification = await prisma.notification.update({
        where: { id: id },
        data: {
          isRead: true,
        },
      });

      await prisma.$disconnect();

      return {
        success: true,
        notification: updatedNotification,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 MARK ALL NOTIFICATIONS AS READ - Direct endpoint (PATCH)
  @Patch("notifications/mark-all-read")
  async markAllNotificationsAsRead() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Update all unread notifications
      const result = await prisma.notification.updateMany({
        where: { isRead: false },
        data: {
          isRead: true,
        },
      });

      await prisma.$disconnect();

      return {
        success: true,
        updatedCount: result.count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 MARK ALL NOTIFICATIONS AS READ - Direct endpoint (POST - Frontend compatibility)
  @Post("notifications/read-all")
  async markAllNotificationsAsReadPost() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Update all unread notifications
      const result = await prisma.notification.updateMany({
        where: { isRead: false },
        data: {
          isRead: true,
        },
      });

      await prisma.$disconnect();

      return {
        success: true,
        updatedCount: result.count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 USERS/ME - Direct endpoint
  @Get("users/me")
  async getCurrentUser() {
    try {
      // Note: In a real app, you'd get user ID from JWT token
      // For now, return a basic user info
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get first user as example (in real app, extract from JWT)
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });

      await prisma.$disconnect();

      return user || { error: "User not found" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 RECURRENT PAYMENTS - Direct endpoint
  @Get("recurrent-payments")
  async getRecurrentPayments() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const payments = await prisma.recurrentPayment.findMany({
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });

      await prisma.$disconnect();

      return payments;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 RECURRENT PAYMENTS NEXT - Direct endpoint (fixed schema)
  @Get("recurrent-payments/last-execution")
  async getLastExecution() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get next upcoming payment (since lastExecution doesn't exist in schema)
      const nextPayment = await prisma.recurrentPayment.findFirst({
        where: {
          isActive: true,
          nextPaymentDate: { gte: new Date() },
        },
        orderBy: { nextPaymentDate: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          amount: true,
          nextPaymentDate: true,
          interval: true,
        },
      });

      await prisma.$disconnect();

      return nextPayment || { message: "No upcoming payments found" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 RECURRENT PAYMENTS EXECUTE - Direct endpoint
  @Post("recurrent-payments/execute")
  async executeRecurrentPayments(): Promise<
    ExecutionResult | { error: string }
  > {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result: ExecutionResult = {
        processedPayments: 0,
        createdTransactions: 0,
        totalAmount: 0,
        executionDate: new Date(),
        details: [],
      };

      // Find all active recurrent payments that are due today
      const duePayments = await prisma.recurrentPayment.findMany({
        where: {
          isActive: true,
          nextPaymentDate: {
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Include payments due until the end of today
          },
        },
        include: {
          category: true,
        },
      });

      result.processedPayments = duePayments.length;

      // Create execution log
      const executionLog = await prisma.automaticExecutionLog.create({
        data: {
          executionDate: result.executionDate,
          processedPayments: result.processedPayments,
          createdTransactions: 0, // Will be updated later
          totalAmount: 0, // Will be updated later
          details: "[]", // Will be updated later
        },
      });

      // Process each payment
      for (const payment of duePayments) {
        // Create transaction
        await prisma.transaction.create({
          data: {
            amount: payment.amount,
            description: `${payment.name} - Pagamento automatico`,
            date: today,
            type: "EXPENSE", // TransactionType.EXPENSE
            categoryId: payment.categoryId,
            userId: payment.userId,
            executionLogId: executionLog.id,
          },
        });

        // Calculate next payment date
        const nextDate = this.calculateNextPaymentDate(
          payment.nextPaymentDate,
          payment.interval,
          payment.dayOfMonth,
          payment.dayOfWeek
        );

        // Update next payment date
        await prisma.recurrentPayment.update({
          where: { id: payment.id },
          data: { nextPaymentDate: nextDate },
        });

        // Add to result details
        const transactionDetails = {
          paymentName: payment.name,
          amount: Number(payment.amount),
          nextDate,
        };
        result.details.push(transactionDetails);

        result.createdTransactions++;
        result.totalAmount += Number(payment.amount);
      }

      // Update execution log with final results
      if (result.processedPayments > 0) {
        await prisma.automaticExecutionLog.update({
          where: { id: executionLog.id },
          data: {
            createdTransactions: result.createdTransactions,
            totalAmount: result.totalAmount,
            details: JSON.stringify(result.details),
          },
        });
      }

      await prisma.$disconnect();
      return result;
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  // Helper method to calculate next payment date
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

  // 🚀 CATEGORIES CRUD - Direct endpoints
  @Post("categories")
  async createCategory(@Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // 🔧 TEMP FIX: Use default user ID for testing if not provided
      let userId = body.userId;
      if (!userId) {
        // Try to get first user from database or create a default one
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          // Create a default test user if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: "test@budjet.app",
              password: "hashed_password", // In real app, this would be properly hashed
              firstName: "Test",
              lastName: "User",
            },
          });
          userId = defaultUser.id;
        }
      }

      const category = await prisma.category.create({
        data: {
          name: body.name,
          icon: body.icon || null,
          color: body.color || null,
          budget: body.budget ? Number(body.budget) : null,
          userId: userId,
        },
      });

      await prisma.$disconnect();
      return category;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("categories/:id")
  async updateCategory(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const category = await prisma.category.update({
        where: { id },
        data: {
          name: body.name,
          icon: body.icon,
          color: body.color,
          budget: body.budget ? Number(body.budget) : null,
        },
      });

      await prisma.$disconnect();
      return category;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("categories/:id")
  async deleteCategory(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      await prisma.category.delete({
        where: { id },
      });

      await prisma.$disconnect();
      return { message: "Category deleted successfully" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 TRANSACTIONS CRUD - Direct endpoints
  @Post("transactions")
  async createTransaction(@Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // 🔧 TEMP FIX: Use default user ID for testing if not provided
      let userId = body.userId;
      if (!userId) {
        // Try to get first user from database or create a default one
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          // Create a default test user if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: "test@budjet.app",
              password: "hashed_password", // In real app, this would be properly hashed
              firstName: "Test",
              lastName: "User",
            },
          });
          userId = defaultUser.id;
        }
      }

      const transaction = await prisma.transaction.create({
        data: {
          amount: Number(body.amount),
          description: body.description || null,
          date: new Date(body.date),
          type: body.type,
          categoryId: body.categoryId,
          userId: userId,
        },
        include: {
          category: true,
        },
      });

      await prisma.$disconnect();
      return transaction;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("transactions/:id")
  async updateTransaction(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          amount: body.amount ? Number(body.amount) : undefined,
          description: body.description,
          date: body.date ? new Date(body.date) : undefined,
          type: body.type,
          categoryId: body.categoryId,
        },
        include: {
          category: true,
        },
      });

      await prisma.$disconnect();
      return transaction;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("transactions/:id")
  async deleteTransaction(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      await prisma.transaction.delete({
        where: { id },
      });

      await prisma.$disconnect();
      return { message: "Transaction deleted successfully" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 RECURRENT PAYMENTS CRUD - Direct endpoints
  @Post("recurrent-payments")
  async createRecurrentPayment(@Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // 🔧 TEMP FIX: Use default user ID for testing if not provided
      let userId = body.userId;
      if (!userId) {
        // Try to get first user from database or create a default one
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          // Create a default test user if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: "test@budjet.app",
              password: "hashed_password", // In real app, this would be properly hashed
              firstName: "Test",
              lastName: "User",
            },
          });
          userId = defaultUser.id;
        }
      }

      const payment = await prisma.recurrentPayment.create({
        data: {
          name: body.name,
          amount: Number(body.amount),
          description: body.description || null,
          interval: body.interval,
          dayOfMonth: body.dayOfMonth || null,
          dayOfWeek: body.dayOfWeek || null,
          startDate: new Date(body.startDate),
          endDate: body.endDate ? new Date(body.endDate) : null,
          nextPaymentDate: new Date(body.nextPaymentDate || body.startDate),
          categoryId: body.categoryId,
          userId: userId,
        },
        include: {
          category: true,
        },
      });

      await prisma.$disconnect();
      return payment;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("recurrent-payments/:id")
  async updateRecurrentPayment(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const payment = await prisma.recurrentPayment.update({
        where: { id },
        data: {
          name: body.name,
          amount: body.amount ? Number(body.amount) : undefined,
          description: body.description,
          interval: body.interval,
          dayOfMonth: body.dayOfMonth,
          dayOfWeek: body.dayOfWeek,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          nextPaymentDate: body.nextPaymentDate
            ? new Date(body.nextPaymentDate)
            : undefined,
          isActive: body.isActive,
          categoryId: body.categoryId,
        },
        include: {
          category: true,
        },
      });

      await prisma.$disconnect();
      return payment;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("recurrent-payments/:id")
  async deleteRecurrentPayment(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      await prisma.recurrentPayment.delete({
        where: { id },
      });

      await prisma.$disconnect();
      return { message: "Recurrent payment deleted successfully" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
