import React, { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector, RootState } from "../store";
import { useAuth } from "../utils/hooks";
import { DashboardDateRange } from "../components/dashboard/DashboardDateRange";
import DashboardStats from "../components/dashboard/DashboardStats";
import ExpensePieChart from "../components/dashboard/ExpensePieChart";
import IncomeExpenseBarChart from "../components/dashboard/IncomeExpenseBarChart";
import BalanceTrendChart from "../components/dashboard/BalanceTrendChart";
import TopCategoriesChart from "../components/dashboard/TopCategoriesChart";
import DailySpendingChart from "../components/dashboard/DailySpendingChart";
import BudgetCategoryProgress from "../components/dashboard/BudgetCategoryProgress";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import TopSpendingCategory from "../components/dashboard/TopSpendingCategory";
import { fetchTransactions } from "../store/slices/transactionSlice";
import { fetchCategories } from "../store/slices/categorySlice";
import useDashboardDateRange from "../utils/hooks/useDashboardDateRange";
import useDashboardCharts from "../utils/hooks/useDashboardCharts";
import { dashboardService } from "../utils/apiServices";
import { DashboardStats as DashboardStatsType } from "../utils/types";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Definizione dell'interfaccia Budget
interface Budget {
  id: number;
  categoryId: number;
  amount: number;
  userId: number;
}

// Funzione per raggruppare le transazioni per mese
const getTransactionsPerMonth = (transactions: any[]) => {
  const result: Record<string, { count: number; month: string }> = {};

  if (!transactions || !Array.isArray(transactions)) return [];

  transactions.forEach((tx) => {
    try {
      const date = new Date(tx.date);
      const monthYear = format(date, "MMM yyyy", { locale: it });

      if (!result[monthYear]) {
        result[monthYear] = { count: 0, month: monthYear };
      }

      result[monthYear].count++;
    } catch (e) {
      console.error("Errore nel processare la data della transazione:", e, tx);
    }
  });

  return Object.values(result).sort((a, b) => a.month.localeCompare(b.month));
};

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // State per i dati della dashboard
  const [dashboardData, setDashboardData] = useState<DashboardStatsType | null>(
    null
  );
  const [categorySpending, setCategorySpending] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  // State per controllo visualizzazione debug info
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Get date range from custom hook
  const {
    selectedTimeRange,
    startDate,
    endDate,
    customStartDate,
    customEndDate,
    handleTimeRangeChange,
    handleCustomStartDateChange,
    handleCustomEndDateChange,
    applyCustomDateRange,
    formatDateForAPI,
  } = useDashboardDateRange();

  // Get data from store
  const transactions = useAppSelector((state: RootState) => state.transactions);
  const categories = useAppSelector((state: RootState) => state.categories);

  // Memorizziamo le date formattate per il controllo
  const startDateFormatted = formatDateForAPI(startDate);
  const endDateFormatted = formatDateForAPI(endDate);

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setIsLoadingDashboard(true);
      setDashboardError(null);

      try {
        // 🔧 Fetch multiple dashboard endpoints in parallel
        const [statsData, categorySpendingData, recentTransactionsData] =
          await Promise.all([
            dashboardService.getStats(startDateFormatted, endDateFormatted),
            dashboardService.getCategorySpending(
              startDateFormatted,
              endDateFormatted
            ),
            dashboardService.getRecentTransactions(5),
          ]);

        setDashboardData(statsData as DashboardStatsType);
        setCategorySpending(categorySpendingData || []);
        setRecentTransactions(recentTransactionsData || []);

        console.log("🎯 Dashboard data loaded successfully:", {
          stats: statsData,
          categorySpending: categorySpendingData,
          recentTransactions: recentTransactionsData,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardError("Failed to load dashboard data");
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboardData();

    // Fetch also transactions for charts and other components that need raw data
    const filters = {
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      limit: 1000, // Aumentiamo il limite a 1000 per ottenere tutte le transazioni nel periodo
      page: 1,
    };

    console.log("Dashboard - Fetching transactions with filters:", filters);

    dispatch(fetchTransactions(filters));
    dispatch(fetchCategories());

    // Dipendenze stabili: solo le stringhe formattate e l'ID dell'utente (se disponibile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    user?.id,
    startDateFormatted,
    endDateFormatted,
    selectedTimeRange,
  ]);

  // Format amount for display - versione sicura
  const formatAmount = (amount: number | string): string => {
    if (amount === undefined || amount === null) {
      return "0.00";
    }

    let numAmount: number;
    if (typeof amount === "string") {
      numAmount = parseFloat(amount);
      if (isNaN(numAmount)) return "0.00";
    } else {
      numAmount = amount;
      if (isNaN(numAmount)) return "0.00";
    }

    return numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Calculate budget data from categories (consistent with Categories page)
  const budgetData = useMemo(() => {
    // 🔧 FIX ISSUE #1: Use same calculation logic as Categories page
    // Get total budget from all categories with budget > 0
    const categoriesWithBudget =
      categories.categories?.filter((cat) => cat.budget && cat.budget > 0) ||
      [];
    const totalBudget = categoriesWithBudget.reduce(
      (total, cat) => total + Number(cat.budget),
      0
    );

    // Get total spent from categorySpending
    const totalSpent =
      categorySpending?.reduce((sum, cat) => sum + (cat.spent || 0), 0) || 0;

    const budgetRemaining = Math.max(0, totalBudget - totalSpent);
    const budgetPercentage =
      totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return {
      totalBudget,
      totalSpent,
      budgetRemaining,
      budgetPercentage,
    };
  }, [categories.categories, categorySpending]);

  // Get chart data from custom hook
  const { monthlyData, balanceData, dailySpending } = useDashboardCharts(
    Array.isArray(transactions.transactions) ? transactions.transactions : [],
    Array.isArray(categories.categories) ? categories.categories : [],
    [], // Non abbiamo più bisogno del budget qui, lo prendiamo da dashboardData
    startDate,
    endDate
  );

  // Loading state
  const isLoading =
    transactions.isLoading || categories.isLoading || isLoadingDashboard;

  // Calcoliamo le transazioni per mese per debug
  const transactionsPerMonth = useMemo(
    () => getTransactionsPerMonth(transactions.transactions),
    [transactions.transactions]
  );

  return (
    <div className="p-3">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Date Range Selector */}
      <DashboardDateRange
        selectedTimeRange={selectedTimeRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
        onTimeRangeChange={handleTimeRangeChange}
        onCustomStartDateChange={handleCustomStartDateChange}
        onCustomEndDateChange={handleCustomEndDateChange}
        onApplyCustomDateRange={applyCustomDateRange}
      />

      {/* Diagnostic Panel - Redesigned */}
      <div className="mb-6 overflow-hidden shadow-md rounded-lg border border-gray-100">
        <div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
        >
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <h3 className="font-semibold">Informazioni di Diagnostica</h3>
          </div>
          <div>
            {showDebugInfo ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        {showDebugInfo && (
          <div className="bg-white p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div
                  className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                    isLoading
                      ? "bg-blue-100 text-blue-500"
                      : "bg-green-100 text-green-500"
                  }`}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">Stato</div>
                  <div className="text-sm text-gray-500">
                    {isLoading
                      ? "Caricamento dati in corso..."
                      : "Caricamento completato"}
                  </div>
                </div>
              </div>

              {/* Period */}
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    Periodo
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateForAPI(startDate)} - {formatDateForAPI(endDate)}
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                    <path
                      fillRule="evenodd"
                      d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    Transazioni
                  </div>
                  <div className="text-sm text-gray-500">
                    {transactions.transactions?.length ?? 0} transazioni nel
                    periodo
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    Categorie
                  </div>
                  <div className="text-sm text-gray-500">
                    {categories.categories?.length ?? 0} categorie attive
                  </div>
                </div>
              </div>
            </div>

            {/* Dettaglio transazioni per mese */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Transazioni per mese
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {transactionsPerMonth.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-sm bg-white p-2 rounded border border-gray-200"
                  >
                    <span className="font-medium">{item.month}:</span>{" "}
                    {item.count} transazioni
                  </div>
                ))}
              </div>
            </div>

            {/* Error message */}
            {dashboardError && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{dashboardError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <p className="text-lg text-gray-500">Caricamento dati...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Utilizziamo le card Stats normali */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardStats
                totalIncome={dashboardData?.totalIncome ?? 0}
                totalExpense={dashboardData?.totalExpenses ?? 0}
                totalBudget={budgetData.totalBudget}
                budgetRemaining={budgetData.budgetRemaining}
                budgetPercentage={budgetData.budgetPercentage}
                formatAmount={formatAmount}
                selectedTimeRange={selectedTimeRange}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
              />
            </div>

            {/* Top Spending Category Card */}
            {categorySpending && categorySpending.length > 0 && (
              <div className="lg:col-span-1">
                {(() => {
                  // Troviamo la categoria con la spesa maggiore dai nuovi dati
                  const topCategory = categorySpending[0]; // Già ordinato dal backend

                  if (!topCategory) {
                    return (
                      <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                        <p className="text-gray-500">
                          Nessuna categoria di spesa
                        </p>
                      </div>
                    );
                  }

                  return (
                    <TopSpendingCategory
                      categoryName={topCategory.categoryName}
                      categoryColor={topCategory.color}
                      amount={topCategory.spent}
                      percentage={Math.round(
                        (topCategory.spent / topCategory.budget) * 100
                      )}
                      formatAmount={formatAmount}
                    />
                  );
                })()}
              </div>
            )}
          </div>

          {/* Charts Grid - 4 colonne per schermi medi e grandi */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Prima riga di grafici */}
            <ExpensePieChart
              expensesByCategory={(categorySpending || []).map(
                (cat, index) => ({
                  id: index,
                  name: cat.categoryName || "Categoria sconosciuta",
                  value: cat.spent || 0,
                  color: cat.color || "#cccccc",
                  percentage:
                    Math.round(
                      (cat.spent /
                        categorySpending.reduce(
                          (total, c) => total + c.spent,
                          0
                        )) *
                        100
                    ) || 0,
                })
              )}
              formatAmount={formatAmount}
            />
            <IncomeExpenseBarChart
              monthlyData={monthlyData || []}
              formatAmount={formatAmount}
            />
            <BalanceTrendChart
              balanceData={balanceData || []}
              formatAmount={formatAmount}
            />
            <DailySpendingChart
              dailySpending={dailySpending || []}
              formatAmount={formatAmount}
            />

            {/* Seconda riga di grafici */}
            <div className="md:col-span-2">
              <RecentTransactions
                transactions={recentTransactions || []}
                formatAmount={formatAmount}
              />
            </div>
            <div className="md:col-span-1">
              <TopCategoriesChart
                topCategories={(categorySpending || [])
                  .slice(0, 5)
                  .map((cat) => ({
                    name: cat.categoryName,
                    amount: cat.spent,
                    color: cat.color,
                  }))}
                formatAmount={formatAmount}
              />
            </div>
            <div className="md:col-span-1">
              <BudgetCategoryProgress
                budgetCategories={(categorySpending || [])
                  .filter((cat) => cat.budget && cat.budget > 0)
                  .map((cat, index) => ({
                    id: index,
                    name: cat.categoryName,
                    color: cat.color,
                    budget: cat.budget || 0,
                    spent: cat.spent || 0,
                    percentage: Math.round((cat.spent / cat.budget) * 100) || 0,
                  }))}
                formatAmount={formatAmount}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
