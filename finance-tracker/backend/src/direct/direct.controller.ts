import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("direct")
@Controller("direct")
export class DirectController {
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
          pages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString(),
      };
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

      // Get basic stats
      const [transactions, income, expenses] = await Promise.all([
        prisma.transaction.count({
          where: {
            date: { gte: start, lte: end },
          },
        }),
        prisma.transaction.aggregate({
          where: {
            date: { gte: start, lte: end },
            amount: { gt: 0 },
          },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: {
            date: { gte: start, lte: end },
            amount: { lt: 0 },
          },
          _sum: { amount: true },
        }),
      ]);

      // Calculate balance
      const totalIncome = Number(income._sum.amount || 0);
      const totalExpenses = Math.abs(Number(expenses._sum.amount || 0));
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
}
