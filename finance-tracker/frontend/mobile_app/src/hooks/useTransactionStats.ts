import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Transaction } from "../types/models";

interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  averageTransactionAmount: number;
  topCategories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expenses: number;
  }[];
  savingsRate: number;
}

export const useTransactionStats = () => {
  const transactions = useSelector(
    (state: RootState) => state.transactions.items
  );
  const categories = useSelector((state: RootState) => state.categories.items);

  return useMemo(() => {
    const stats: TransactionStats = {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      averageTransactionAmount: 0,
      topCategories: [],
      monthlyTrend: [],
      savingsRate: 0,
    };

    // Calculate totals and monthly trends
    const monthlyData = new Map<string, { income: number; expenses: number }>();
    const categoryTotals = new Map<string, number>();

    transactions.forEach((transaction) => {
      const amount = transaction.amount;
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      // Update monthly data
      const monthData = monthlyData.get(monthKey) || { income: 0, expenses: 0 };
      if (transaction.type === "income") {
        monthData.income += amount;
        stats.totalIncome += amount;
      } else {
        monthData.expenses += amount;
        stats.totalExpenses += amount;
      }
      monthlyData.set(monthKey, monthData);

      // Update category totals
      if (transaction.type === "expense") {
        const currentTotal = categoryTotals.get(transaction.categoryId) || 0;
        categoryTotals.set(transaction.categoryId, currentTotal + amount);
      }
    });

    // Calculate balance
    stats.balance = stats.totalIncome - stats.totalExpenses;

    // Calculate average transaction amount
    stats.averageTransactionAmount =
      transactions.length > 0
        ? (stats.totalIncome + stats.totalExpenses) / transactions.length
        : 0;

    // Calculate top categories
    const sortedCategories = Array.from(categoryTotals.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    stats.topCategories = sortedCategories.map(([categoryId, amount]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        name: category?.name || "Unknown",
        amount,
        percentage: (amount / stats.totalExpenses) * 100,
      };
    });

    // Calculate monthly trend
    stats.monthlyTrend = Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, data]) => ({
        month: monthKey,
        income: data.income,
        expenses: data.expenses,
      }));

    // Calculate savings rate
    stats.savingsRate =
      stats.totalIncome > 0
        ? ((stats.totalIncome - stats.totalExpenses) / stats.totalIncome) * 100
        : 0;

    return stats;
  }, [transactions, categories]);
};
