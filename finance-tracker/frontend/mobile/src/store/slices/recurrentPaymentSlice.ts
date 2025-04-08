import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { recurrentPaymentService } from "../../api/services";
import {
  RecurrentPayment,
  CreateRecurrentPaymentData,
  UpdateRecurrentPaymentData,
} from "../../types";

interface RecurrentPaymentState {
  recurrentPayments: RecurrentPayment[];
  selectedRecurrentPayment: RecurrentPayment | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RecurrentPaymentState = {
  recurrentPayments: [],
  selectedRecurrentPayment: null,
  isLoading: false,
  error: null,
};

export const fetchRecurrentPayments = createAsyncThunk(
  "recurrentPayments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await recurrentPaymentService.getAll();
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recurrent payments"
      );
    }
  }
);

export const fetchRecurrentPaymentById = createAsyncThunk(
  "recurrentPayments/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await recurrentPaymentService.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recurrent payment"
      );
    }
  }
);

export const createRecurrentPayment = createAsyncThunk(
  "recurrentPayments/create",
  async (data: CreateRecurrentPaymentData, { rejectWithValue }) => {
    try {
      const response = await recurrentPaymentService.create(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create recurrent payment"
      );
    }
  }
);

export const updateRecurrentPayment = createAsyncThunk(
  "recurrentPayments/update",
  async (
    { id, data }: { id: string; data: UpdateRecurrentPaymentData },
    { rejectWithValue }
  ) => {
    try {
      const response = await recurrentPaymentService.update(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update recurrent payment"
      );
    }
  }
);

export const deleteRecurrentPayment = createAsyncThunk(
  "recurrentPayments/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await recurrentPaymentService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete recurrent payment"
      );
    }
  }
);

const recurrentPaymentSlice = createSlice({
  name: "recurrentPayments",
  initialState,
  reducers: {
    setSelectedRecurrentPayment: (
      state,
      action: PayloadAction<RecurrentPayment | null>
    ) => {
      state.selectedRecurrentPayment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Recurrent Payments
      .addCase(fetchRecurrentPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchRecurrentPayments.fulfilled,
        (state, action: PayloadAction<RecurrentPayment[]>) => {
          state.isLoading = false;
          state.recurrentPayments = action.payload;
        }
      )
      .addCase(fetchRecurrentPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Recurrent Payment By Id
      .addCase(fetchRecurrentPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchRecurrentPaymentById.fulfilled,
        (state, action: PayloadAction<RecurrentPayment>) => {
          state.isLoading = false;
          state.selectedRecurrentPayment = action.payload;
        }
      )
      .addCase(fetchRecurrentPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Recurrent Payment
      .addCase(createRecurrentPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createRecurrentPayment.fulfilled,
        (state, action: PayloadAction<RecurrentPayment>) => {
          state.isLoading = false;
          state.recurrentPayments = [
            ...state.recurrentPayments,
            action.payload,
          ];
        }
      )
      .addCase(createRecurrentPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Recurrent Payment
      .addCase(updateRecurrentPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateRecurrentPayment.fulfilled,
        (state, action: PayloadAction<RecurrentPayment>) => {
          state.isLoading = false;

          // Update in list
          const index = state.recurrentPayments.findIndex(
            (rp) => rp.id === action.payload.id
          );
          if (index !== -1) {
            state.recurrentPayments[index] = action.payload;
          }

          // Update selected if it's the same
          if (state.selectedRecurrentPayment?.id === action.payload.id) {
            state.selectedRecurrentPayment = action.payload;
          }
        }
      )
      .addCase(updateRecurrentPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Recurrent Payment
      .addCase(deleteRecurrentPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteRecurrentPayment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.recurrentPayments = state.recurrentPayments.filter(
            (rp) => rp.id !== action.payload
          );

          // Clear selected if it's the deleted one
          if (state.selectedRecurrentPayment?.id === action.payload) {
            state.selectedRecurrentPayment = null;
          }
        }
      )
      .addCase(deleteRecurrentPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedRecurrentPayment, clearError } =
  recurrentPaymentSlice.actions;
export default recurrentPaymentSlice.reducer;
