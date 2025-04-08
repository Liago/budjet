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
      const response = await dashboardService.getStats(startDate, endDate);
      return response;
    } catch (error: any) {
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
