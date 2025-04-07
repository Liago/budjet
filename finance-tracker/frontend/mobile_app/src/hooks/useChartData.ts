import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Transaction } from "../types/models";

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export const useChartData = () => {
  const transactions = useSelector(
    (state: RootState) => state.transactions.items
  );

  const monthlyData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    const labels = last6Months.map((date) =>
      date.toLocaleDateString("it-IT", { month: "short" })
    );

    const expenses = last6Months.map((date) => {
      return transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            new Date(t.date).getMonth() === date.getMonth() &&
            new Date(t.date).getFullYear() === date.getFullYear()
        )
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const incomes = last6Months.map((date) => {
      return transactions
        .filter(
          (t) =>
            t.type === "income" &&
            new Date(t.date).getMonth() === date.getMonth() &&
            new Date(t.date).getFullYear() === date.getFullYear()
        )
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      labels,
      datasets: [
        {
          data: expenses,
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // red
          strokeWidth: 2,
        },
        {
          data: incomes,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // green
          strokeWidth: 2,
        },
      ],
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories = useSelector(
      (state: RootState) => state.categories.items
    );

    const expenseCategories = categories.filter((c) => c.type === "expense");
    const incomeCategories = categories.filter((c) => c.type === "income");

    const expenseData = expenseCategories.map((category) => {
      return transactions
        .filter((t) => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const incomeData = incomeCategories.map((category) => {
      return transactions
        .filter((t) => t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
    });

    return {
      expenses: {
        labels: expenseCategories.map((c) => c.name),
        datasets: [
          {
            data: expenseData,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
          },
        ],
      },
      incomes: {
        labels: incomeCategories.map((c) => c.name),
        datasets: [
          {
            data: incomeData,
            color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          },
        ],
      },
    };
  }, [transactions]);

  return {
    monthlyData,
    categoryData,
  };
};
