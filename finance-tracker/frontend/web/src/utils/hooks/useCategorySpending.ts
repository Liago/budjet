import { useState, useEffect } from "react";
import { format, subMonths } from "date-fns";
import { transactionService } from "../apiServices";
import { Category } from "../types";

interface CategorySpendingData {
  currentSpending: { [key: string]: number };
  monthlyAverages: { [key: string]: number };
}

const useCategorySpending = (categories: Category[], timeFilter: string) => {
  const [categorySpending, setCategorySpending] = useState<{
    [key: string]: number;
  }>({});
  const [monthlyAverages, setMonthlyAverages] = useState<{
    [key: string]: number;
  }>({});
  const [loadingSpending, setLoadingSpending] = useState(false);

  // Generate list of available months
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const label = date.toLocaleString("it-IT", {
        month: "long",
        year: "numeric",
      });

      months.push({ value, label });
    }

    return months;
  };

  const availableMonths = getAvailableMonths();

  // Fetch spending data when timeFilter changes
  useEffect(() => {
    if (timeFilter !== "all" && categories.length > 0) {
      fetchSpendingData();
    }
  }, [timeFilter, categories]);

  // Function to fetch both current spending and historical average
  const fetchSpendingData = async () => {
    setLoadingSpending(true);

    try {
      // 1. Get current period spending
      await fetchCurrentPeriodSpending();

      // 2. Calculate monthly averages based on last 6 months
      await calculateMonthlyAverages();
    } catch (error) {
      console.error("Error fetching spending data:", error);
    } finally {
      setLoadingSpending(false);
    }
  };

  // Function to fetch spending data for the selected month
  const fetchCurrentPeriodSpending = async () => {
    try {
      let startDate, endDate;

      if (timeFilter === "current-month") {
        // For current month
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1; // getMonth() is 0-based

        startDate = format(
          new Date(currentYear, currentMonth - 1, 1),
          "yyyy-MM-dd"
        );
        endDate = format(new Date(currentYear, currentMonth, 0), "yyyy-MM-dd"); // Last day of month
      } else {
        // For specific selected month
        const [year, month] = timeFilter.split("-");
        startDate = format(
          new Date(parseInt(year), parseInt(month) - 1, 1),
          "yyyy-MM-dd"
        );
        endDate = format(
          new Date(parseInt(year), parseInt(month), 0),
          "yyyy-MM-dd"
        ); // Last day of month
      }

      console.log(
        "Fetching spending data for period:",
        startDate,
        "to",
        endDate
      );

      const response = await transactionService.getAll({
        startDate,
        endDate,
        type: "EXPENSE",
        limit: 1000, // High limit to get all transactions
      });

      console.log("Spending data response:", response);

      const spending: { [key: string]: number } = {};

      // Initialize all categories with 0
      categories.forEach((category) => {
        spending[category.id] = 0;
      });

      // Sum up expenses by category
      if (response.data) {
        response.data.forEach((transaction) => {
          const categoryId = transaction.category.id;
          if (spending[categoryId] !== undefined) {
            spending[categoryId] += Number(transaction.amount);
          } else {
            spending[categoryId] = Number(transaction.amount);
          }
        });
      }

      console.log("Calculated spending by category:", spending);
      setCategorySpending(spending);
    } catch (error) {
      console.error("Error fetching current period spending:", error);
    }
  };

  // Function to calculate monthly averages based on last 6 months
  const calculateMonthlyAverages = async () => {
    try {
      const today = new Date();
      const sixMonthsAgo = subMonths(today, 6);

      const startDate = format(sixMonthsAgo, "yyyy-MM-dd");
      const endDate = format(today, "yyyy-MM-dd");

      console.log(
        "Fetching historical data for averages:",
        startDate,
        "to",
        endDate
      );

      const response = await transactionService.getAll({
        startDate,
        endDate,
        type: "EXPENSE",
        limit: 2000, // Higher limit for historical data
      });

      const monthlySpendingMap = new Map<string, Map<string, number>>();

      // Group transactions by category and month
      if (response.data) {
        response.data.forEach((transaction) => {
          const categoryId = transaction.category.id;
          const monthKey = format(new Date(transaction.date), "yyyy-MM");

          if (!monthlySpendingMap.has(categoryId)) {
            monthlySpendingMap.set(categoryId, new Map());
          }

          const categoryMonthlyData = monthlySpendingMap.get(categoryId)!;
          const currentAmount = categoryMonthlyData.get(monthKey) || 0;
          categoryMonthlyData.set(
            monthKey,
            currentAmount + Number(transaction.amount)
          );
        });
      }

      // Calculate averages
      const averages: { [key: string]: number } = {};

      categories.forEach((category) => {
        const categoryMonthlyData = monthlySpendingMap.get(category.id);
        if (categoryMonthlyData && categoryMonthlyData.size > 0) {
          const monthlyAmounts = Array.from(categoryMonthlyData.values());
          const total = monthlyAmounts.reduce((sum, amount) => sum + amount, 0);
          const average = total / monthlyAmounts.length;
          averages[category.id] = Math.round(average * 100) / 100; // Round to 2 decimal places
        } else {
          averages[category.id] = 0;
        }
      });

      console.log("Calculated monthly averages:", averages);
      setMonthlyAverages(averages);
    } catch (error) {
      console.error("Error calculating monthly averages:", error);
    }
  };

  return {
    categorySpending,
    monthlyAverages,
    loadingSpending,
    availableMonths,
  };
};

export default useCategorySpending;
