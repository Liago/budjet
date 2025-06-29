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
}
