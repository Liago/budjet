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

  // 🚀 RECURRENT PAYMENTS LAST EXECUTION - Direct endpoint (fixed schema)
  @Get("recurrent-payments/last-execution")
  async getLastExecution() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get the most recent execution log
      const lastExecution = await prisma.automaticExecutionLog.findFirst({
        orderBy: { executionDate: "desc" },
        select: {
          executionDate: true,
          processedPayments: true,
          createdTransactions: true,
          totalAmount: true,
          details: true,
        },
      });

      await prisma.$disconnect();

      if (!lastExecution) {
        return {
          executionDate: null,
          processedPayments: 0,
          createdTransactions: 0,
          totalAmount: 0,
          details: [], // 🔧 Always return an array even if empty
        };
      }

      // Parse details JSON string back to array
      let parsedDetails = [];
      try {
        parsedDetails = lastExecution.details
          ? JSON.parse(lastExecution.details)
          : [];
      } catch (parseError) {
        console.error("Error parsing execution details:", parseError);
        parsedDetails = [];
      }

      return {
        executionDate: lastExecution.executionDate.toISOString(),
        processedPayments: lastExecution.processedPayments,
        createdTransactions: lastExecution.createdTransactions,
        totalAmount: Number(lastExecution.totalAmount),
        details: parsedDetails, // 🔧 Ensure details is always an array
      };
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
          tags: true, // 🔧 Include tags to prevent frontend crash
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
          tags: true, // 🔧 Include tags to prevent frontend crash
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

  // 🚀 DASHBOARD ADVANCED ENDPOINTS - Direct endpoints for Netlify compatibility
  @Get("dashboard/budget-analysis")
  async getBudgetAnalysis(@Query("timeRange") timeRange = "1m") {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Calculate date range based on timeRange
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case "1m":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "3m":
          startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          break;
        case "6m":
          startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          break;
        case "1y":
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get categories with budget
      const categories = await prisma.category.findMany({
        where: { budget: { not: null } },
      });

      const budgetAnalysis = await Promise.all(
        categories.map(async (category) => {
          const expenses = await prisma.transaction.aggregate({
            where: {
              categoryId: category.id,
              type: "EXPENSE",
              date: { gte: startDate, lte: now },
            },
            _sum: { amount: true },
          });

          const spent = Number(expenses._sum.amount || 0);
          const budget = Number(category.budget || 0);
          const remaining = budget - spent;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const deviation = spent - budget;
          const deviationPercentage =
            budget > 0 ? Math.abs((deviation / budget) * 100) : 0;

          return {
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color || "#999999",
            budget,
            spent,
            amount: spent, // 🔧 Add 'amount' field for frontend compatibility
            remaining,
            percentage: Math.round(percentage * 100) / 100,
            budgetPercentage: Math.round(percentage * 100) / 100, // 🔧 Add budgetPercentage field
            deviation,
            deviationPercentage: Math.round(deviationPercentage * 100) / 100,
            status:
              percentage > 100 ? "over" : percentage > 80 ? "warning" : "good",
            color: category.color,
            isOverBudget: percentage > 100,
          };
        })
      );

      // 🔧 Calculate totals for frontend compatibility
      const totalBudget = budgetAnalysis.reduce(
        (sum, cat) => sum + cat.budget,
        0
      );
      const totalSpent = budgetAnalysis.reduce(
        (sum, cat) => sum + cat.spent,
        0
      );
      const totalRemaining = totalBudget - totalSpent;
      const totalDeviation = totalSpent - totalBudget;
      const totalDeviationPercentage =
        totalBudget > 0
          ? Math.round((Math.abs(totalDeviation) / totalBudget) * 100 * 100) /
            100
          : 0;

      // 🔧 Return structured response that frontend expects
      const response = {
        categoryAnalysis: budgetAnalysis.sort(
          (a, b) => b.percentage - a.percentage
        ),
        totalBudget,
        totalSpent,
        totalRemaining,
        totalDeviation,
        totalDeviationPercentage,
        summary: {
          categoriesOverBudget: budgetAnalysis.filter((cat) => cat.isOverBudget)
            .length,
          categoriesWithBudget: budgetAnalysis.length,
          averageSpendingPercentage:
            budgetAnalysis.length > 0
              ? Math.round(
                  (budgetAnalysis.reduce(
                    (sum, cat) => sum + cat.percentage,
                    0
                  ) /
                    budgetAnalysis.length) *
                    100
                ) / 100
              : 0,
        },
      };

      await prisma.$disconnect();
      return response;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("dashboard/trends")
  async getTrends(@Query("timeRange") timeRange = "3m") {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const months = parseInt(timeRange.replace("m", "")) || 3;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      // Get monthly trends
      const transactions = await prisma.transaction.findMany({
        where: { date: { gte: startDate } },
        include: { category: true },
        orderBy: { date: "asc" },
      });

      // Group by month
      const monthlyData = new Map();

      transactions.forEach((transaction) => {
        const monthKey = transaction.date.toISOString().substring(0, 7); // YYYY-MM
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            income: 0,
            expenses: 0,
            transactions: 0,
          });
        }

        const data = monthlyData.get(monthKey);
        if (transaction.type === "INCOME") {
          data.income += Number(transaction.amount);
        } else {
          data.expenses += Number(transaction.amount);
        }
        data.transactions += 1;
      });

      // Convert to array and calculate trends
      const trends = Array.from(monthlyData.entries()).map(([month, data]) => ({
        period: month,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
        transactions: data.transactions,
      }));

      await prisma.$disconnect();
      return { trends, categoryTrends: [] }; // Simplified version
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("dashboard/forecast")
  async getForecastData(@Query("months") months = "6") {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const monthsNum = parseInt(months.toString()) || 6;
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

      // Get historical data
      const transactions = await prisma.transaction.findMany({
        where: { date: { gte: threeMonthsAgo } },
        orderBy: { date: "asc" },
      });

      // Calculate averages
      const totalIncome = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalExpenses = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const avgIncome = totalIncome / 3;
      const avgExpense = totalExpenses / 3;

      // Generate historical data
      const historicalData = [];
      for (let i = 2; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthTransactions = transactions.filter(
          (t) =>
            t.date.getMonth() === date.getMonth() &&
            t.date.getFullYear() === date.getFullYear()
        );

        const monthIncome = monthTransactions
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const monthExpenses = monthTransactions
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + Number(t.amount), 0);

        historicalData.push({
          period: date.toISOString().substring(0, 7),
          value: monthIncome - monthExpenses,
          forecast: false,
        });
      }

      // Generate forecast data
      const forecastData = [];
      for (let i = 1; i <= monthsNum; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        forecastData.push({
          period: date.toISOString().substring(0, 7),
          value: Math.round(avgIncome - avgExpense),
          forecast: true,
        });
      }

      await prisma.$disconnect();
      return {
        historicalData,
        forecastData,
        averageIncome: Math.round(avgIncome),
        averageExpense: Math.round(avgExpense),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("dashboard/savings")
  async getSavingSuggestions() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get spending by category for analysis
      const categorySpending = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          type: "EXPENSE",
          date: { gte: lastMonth, lt: currentMonth },
        },
        _sum: { amount: true },
        _count: { id: true },
      });

      const suggestions = [];
      let totalPotentialSavings = 0;

      // Simple suggestions based on spending patterns
      for (const spending of categorySpending) {
        const category = await prisma.category.findUnique({
          where: { id: spending.categoryId },
        });

        if (category && spending._sum.amount) {
          const monthlySpent = Number(spending._sum.amount);
          let potentialSaving = 0;
          let suggestion = "";

          if (monthlySpent > 200) {
            potentialSaving = monthlySpent * 0.1; // 10% reduction
            suggestion = `Riduci le spese in ${category.name} del 10%`;
          } else if (monthlySpent > 100) {
            potentialSaving = monthlySpent * 0.05; // 5% reduction
            suggestion = `Ottimizza le spese in ${category.name}`;
          }

          if (potentialSaving > 0) {
            suggestions.push({
              id: category.id,
              category: category.name,
              categoryColor: category.color || "#999999",
              description: suggestion,
              potentialSaving: Math.round(potentialSaving),
              type: "spending_reduction",
              difficulty: potentialSaving > 50 ? "medium" : "easy",
              impact:
                potentialSaving > 100
                  ? "high"
                  : potentialSaving > 50
                  ? "medium"
                  : "low",
            });
            totalPotentialSavings += potentialSaving;
          }
        }
      }

      // Calculate averages
      const avgIncome = await prisma.transaction.aggregate({
        where: {
          type: "INCOME",
          date: { gte: lastMonth, lt: currentMonth },
        },
        _sum: { amount: true },
      });

      const avgExpense = await prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: { gte: lastMonth, lt: currentMonth },
        },
        _sum: { amount: true },
      });

      await prisma.$disconnect();
      return {
        suggestions,
        averageIncome: Number(avgIncome._sum.amount || 0),
        averageExpense: Number(avgExpense._sum.amount || 0),
        potentialMonthlySavings: Math.round(totalPotentialSavings),
        yearlyProjection: Math.round(totalPotentialSavings * 12),
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 🚀 SAVINGS GOALS CRUD - Direct endpoints for Netlify compatibility
  @Get("savings-goals")
  async getSavingsGoals() {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get default user ID (in real app, would get from JWT)
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) {
        await prisma.$disconnect();
        return { error: "No user found" };
      }

      const savingsGoals = await prisma.savingsGoal.findMany({
        where: { userId: firstUser.id },
        orderBy: { createdAt: "desc" },
      });

      await prisma.$disconnect();
      return savingsGoals;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("savings-goals")
  async createSavingsGoal(@Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      // Get default user ID (in real app, would get from JWT)
      let userId = body.userId;
      if (!userId) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          userId = firstUser.id;
        } else {
          // Create a default test user if none exists
          const defaultUser = await prisma.user.create({
            data: {
              email: "test@budjet.app",
              password: "hashed_password",
              firstName: "Test",
              lastName: "User",
            },
          });
          userId = defaultUser.id;
        }
      }

      const savingsGoal = await prisma.savingsGoal.create({
        data: {
          name: body.name,
          targetAmount: Number(body.targetAmount),
          currentAmount: Number(body.currentAmount || 0),
          deadline: body.deadline ? new Date(body.deadline) : null,
          description: body.description || null,
          userId: userId,
        },
      });

      await prisma.$disconnect();
      return savingsGoal;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Patch("savings-goals/:id")
  async updateSavingsGoal(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const savingsGoal = await prisma.savingsGoal.update({
        where: { id },
        data: {
          name: body.name,
          targetAmount: body.targetAmount
            ? Number(body.targetAmount)
            : undefined,
          currentAmount: body.currentAmount
            ? Number(body.currentAmount)
            : undefined,
          deadline: body.deadline ? new Date(body.deadline) : undefined,
          description: body.description,
          isCompleted: body.isCompleted,
        },
      });

      await prisma.$disconnect();
      return savingsGoal;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Delete("savings-goals/:id")
  async deleteSavingsGoal(@Param("id") id: string) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      await prisma.savingsGoal.delete({
        where: { id },
      });

      await prisma.$disconnect();
      return { message: "Savings goal deleted successfully" };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("savings-goals/:id/add-amount")
  async addAmountToSavingsGoal(@Param("id") id: string, @Body() body: any) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      await prisma.$connect();

      const savingsGoal = await prisma.savingsGoal.findUnique({
        where: { id },
      });

      if (!savingsGoal) {
        await prisma.$disconnect();
        return { error: "Savings goal not found" };
      }

      const newCurrentAmount =
        Number(savingsGoal.currentAmount) + Number(body.amount);
      const isCompleted = newCurrentAmount >= Number(savingsGoal.targetAmount);

      const updatedGoal = await prisma.savingsGoal.update({
        where: { id },
        data: {
          currentAmount: newCurrentAmount,
          isCompleted,
        },
      });

      await prisma.$disconnect();
      return updatedGoal;
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
