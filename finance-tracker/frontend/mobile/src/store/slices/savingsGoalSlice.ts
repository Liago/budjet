import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { savingsGoalsService } from "../../api/services";
import { SavingsGoal } from "../../types";

interface SavingsGoalState {
  savingsGoals: SavingsGoal[];
  selectedSavingsGoal: SavingsGoal | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SavingsGoalState = {
  savingsGoals: [],
  selectedSavingsGoal: null,
  isLoading: false,
  error: null,
};

export const fetchSavingsGoals = createAsyncThunk(
  "savingsGoals/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await savingsGoalsService.getAll();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch savings goals"
      );
    }
  }
);

export const fetchSavingsGoalById = createAsyncThunk(
  "savingsGoals/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await savingsGoalsService.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch savings goal"
      );
    }
  }
);

export const createSavingsGoal = createAsyncThunk(
  "savingsGoals/create",
  async (goalData: any, { rejectWithValue }) => {
    try {
      const response = await savingsGoalsService.create(goalData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create savings goal"
      );
    }
  }
);

export const updateSavingsGoal = createAsyncThunk(
  "savingsGoals/update",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await savingsGoalsService.update(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update savings goal"
      );
    }
  }
);

export const deleteSavingsGoal = createAsyncThunk(
  "savingsGoals/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await savingsGoalsService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete savings goal"
      );
    }
  }
);

export const addAmountToSavingsGoal = createAsyncThunk(
  "savingsGoals/addAmount",
  async (
    { id, amount }: { id: string; amount: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await savingsGoalsService.addAmount(id, amount);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add amount to savings goal"
      );
    }
  }
);

const savingsGoalSlice = createSlice({
  name: "savingsGoals",
  initialState,
  reducers: {
    setSelectedSavingsGoal: (
      state,
      action: PayloadAction<SavingsGoal | null>
    ) => {
      state.selectedSavingsGoal = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Savings Goals
      .addCase(fetchSavingsGoals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchSavingsGoals.fulfilled,
        (state, action: PayloadAction<SavingsGoal[]>) => {
          state.isLoading = false;
          state.savingsGoals = action.payload;
        }
      )
      .addCase(fetchSavingsGoals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Savings Goal By Id
      .addCase(fetchSavingsGoalById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchSavingsGoalById.fulfilled,
        (state, action: PayloadAction<SavingsGoal>) => {
          state.isLoading = false;
          state.selectedSavingsGoal = action.payload;
        }
      )
      .addCase(fetchSavingsGoalById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Savings Goal
      .addCase(createSavingsGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createSavingsGoal.fulfilled,
        (state, action: PayloadAction<SavingsGoal>) => {
          state.isLoading = false;
          state.savingsGoals = [...state.savingsGoals, action.payload];
        }
      )
      .addCase(createSavingsGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Savings Goal
      .addCase(updateSavingsGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateSavingsGoal.fulfilled,
        (state, action: PayloadAction<SavingsGoal>) => {
          state.isLoading = false;

          // Update in the list
          const index = state.savingsGoals.findIndex(
            (sg) => sg.id === action.payload.id
          );
          if (index !== -1) {
            state.savingsGoals[index] = action.payload;
          }

          // Update selected if it's the same
          if (state.selectedSavingsGoal?.id === action.payload.id) {
            state.selectedSavingsGoal = action.payload;
          }
        }
      )
      .addCase(updateSavingsGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Savings Goal
      .addCase(deleteSavingsGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteSavingsGoal.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.savingsGoals = state.savingsGoals.filter(
            (sg) => sg.id !== action.payload
          );

          // Clear selected if it's the deleted one
          if (state.selectedSavingsGoal?.id === action.payload) {
            state.selectedSavingsGoal = null;
          }
        }
      )
      .addCase(deleteSavingsGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add Amount To Savings Goal
      .addCase(addAmountToSavingsGoal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addAmountToSavingsGoal.fulfilled,
        (state, action: PayloadAction<SavingsGoal>) => {
          state.isLoading = false;

          // Update in the list
          const index = state.savingsGoals.findIndex(
            (sg) => sg.id === action.payload.id
          );
          if (index !== -1) {
            state.savingsGoals[index] = action.payload;
          }

          // Update selected if it's the same
          if (state.selectedSavingsGoal?.id === action.payload.id) {
            state.selectedSavingsGoal = action.payload;
          }
        }
      )
      .addCase(addAmountToSavingsGoal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedSavingsGoal, clearError } = savingsGoalSlice.actions;
export default savingsGoalSlice.reducer;
