import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { dashboardService } from "../../api/services";
import { DashboardStats } from "../../types";

interface DashboardState {
  stats: DashboardStats | null;
  trendData: any | null;
  budgetAnalysis: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  trendData: null,
  budgetAnalysis: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Fetching dashboard stats with dates:", {
        startDate,
        endDate,
      });
      const response = await dashboardService.getStats(startDate, endDate);
      console.log("Dashboard stats response:", response);

      // Ensure all required fields are present and correctly typed as numbers
      const processedResponse = {
        ...response,
        totalIncome:
          typeof response.totalIncome === "number"
            ? response.totalIncome
            : typeof response.totalIncome === "string"
            ? parseFloat(response.totalIncome)
            : 0,
        // 🔧 FIX: L'API restituisce 'totalExpenses' (plurale), non 'totalExpense'
        totalExpense:
          typeof response.totalExpenses === "number"
            ? response.totalExpenses
            : typeof response.totalExpenses === "string"
            ? parseFloat(response.totalExpenses)
            : 0,
        balance:
          typeof response.balance === "number"
            ? response.balance
            : typeof response.balance === "string"
            ? parseFloat(response.balance)
            : 0,
        totalBudget:
          typeof response.totalBudget === "number"
            ? response.totalBudget
            : typeof response.totalBudget === "string"
            ? parseFloat(response.totalBudget)
            : 0,
        budgetRemaining:
          typeof response.budgetRemaining === "number"
            ? response.budgetRemaining
            : typeof response.budgetRemaining === "string"
            ? parseFloat(response.budgetRemaining)
            : 0,
        budgetPercentage:
          typeof response.budgetPercentage === "number"
            ? response.budgetPercentage
            : typeof response.budgetPercentage === "string"
            ? parseFloat(response.budgetPercentage)
            : 0,
        // 🔧 FIX: Gestione recentTransactions - se non esistono, array vuoto
        recentTransactions: Array.isArray(response.recentTransactions)
          ? response.recentTransactions.map((t) => ({
              ...t,
              amount:
                typeof t.amount === "number"
                  ? t.amount
                  : typeof t.amount === "string"
                  ? parseFloat(t.amount)
                  : 0,
            }))
          : [],
      };

      console.log("Processed dashboard response:", processedResponse);
      return processedResponse;
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard statistics"
      );
    }
  }
);

export const fetchTrendData = createAsyncThunk(
  "dashboard/fetchTrendData",
  async (timeRange: string = "3m", { rejectWithValue }) => {
    try {
      const response = await dashboardService.getTrendData(timeRange);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch trend data"
      );
    }
  }
);

export const fetchBudgetAnalysis = createAsyncThunk(
  "dashboard/fetchBudgetAnalysis",
  async (timeRange: string = "1m", { rejectWithValue }) => {
    try {
      const response = await dashboardService.getBudgetAnalysis(timeRange);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch budget analysis"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      state.stats = null;
      state.trendData = null;
      state.budgetAnalysis = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDashboardStats.fulfilled,
        (state, action: PayloadAction<DashboardStats>) => {
          state.isLoading = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Trend Data
      .addCase(fetchTrendData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTrendData.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.trendData = action.payload;
        }
      )
      .addCase(fetchTrendData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Budget Analysis
      .addCase(fetchBudgetAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchBudgetAnalysis.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.isLoading = false;
          state.budgetAnalysis = action.payload;
        }
      )
      .addCase(fetchBudgetAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardData, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
