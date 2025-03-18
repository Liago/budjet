import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dashboardService } from '../../utils/apiServices';
import { DashboardStats } from '../../utils/types';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
  dateRange: {
    startDate: null,
    endDate: null,
  },
};

// Fetch dashboard statistics
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (
    { startDate, endDate }: { startDate?: string; endDate?: string },
    { rejectWithValue }
  ) => {
    try {
      return await dashboardService.getStats(startDate, endDate);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ startDate: string | null; endDate: string | null }>
    ) => {
      state.dateRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError, setDateRange } = dashboardSlice.actions;
export default dashboardSlice.reducer; 