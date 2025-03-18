import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MonthlyReportDto } from './dto/monthly-report.dto';
import { AnnualReportDto } from './dto/annual-report.dto';
import { TransactionType } from '../common/constants';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyReport(userId: string, dto: MonthlyReportDto) {
    const now = new Date();
    const year = dto.year || now.getFullYear();
    const month = dto.month || now.getMonth() + 1;

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Get all transactions for the month
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    // Calculate income and expense totals
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Group expenses by category
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const categoryMap = new Map();

    for (const transaction of expenseTransactions) {
      const { categoryId, amount, category } = transaction;
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: category.name,
          icon: category.icon,
          color: category.color,
          amount: 0,
        });
      }
      categoryMap.get(categoryId).amount += Number(amount);
    }

    // Convert to array and calculate percentages
    const categories = Array.from(categoryMap.values()).map(category => ({
      ...category,
      amount: Number(category.amount.toFixed(2)),
      percentage: expense > 0 ? Number(((category.amount / expense) * 100).toFixed(2)) : 0,
    }));

    // Sort categories by amount (descending)
    categories.sort((a, b) => b.amount - a.amount);

    return {
      income: Number(income.toFixed(2)),
      expense: Number(expense.toFixed(2)),
      balance: Number((income - expense).toFixed(2)),
      categories,
      period: {
        year,
        month,
      },
    };
  }

  async getAnnualReport(userId: string, dto: AnnualReportDto) {
    const now = new Date();
    const year = dto.year || now.getFullYear();

    // Create date range for the year
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    // Get all transactions for the year
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Calculate income and expense totals
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Group by month
    const monthlyData = Array(12).fill(0).map((_, index) => {
      const monthTransactions = transactions.filter(t => {
        const transactionMonth = new Date(t.date).getMonth();
        return transactionMonth === index;
      });

      const monthlyIncome = monthTransactions
        .filter(t => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const monthlyExpense = monthTransactions
        .filter(t => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        month: index + 1,
        income: Number(monthlyIncome.toFixed(2)),
        expense: Number(monthlyExpense.toFixed(2)),
        balance: Number((monthlyIncome - monthlyExpense).toFixed(2)),
      };
    });

    return {
      income: Number(income.toFixed(2)),
      expense: Number(expense.toFixed(2)),
      balance: Number((income - expense).toFixed(2)),
      months: monthlyData,
      year,
    };
  }
} 