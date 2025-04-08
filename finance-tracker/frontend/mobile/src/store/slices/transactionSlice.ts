import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { transactionService } from "../../api/services";
import {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  PaginatedResponse,
} from "../../types";

interface TransactionState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  selectedTransaction: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  filters: {
    page: 1,
    limit: 10,
    sortBy: "date",
    sortDirection: "desc",
  },
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchAll",
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const response = await transactionService.getAll(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  "transactions/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await transactionService.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch transaction"
      );
    }
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/create",
  async (transactionData: CreateTransactionData, { rejectWithValue }) => {
    try {
      const response = await transactionService.create(transactionData);
      return response;
    } catch (error: any) {
      console.log(
        "Errore completo durante la creazione della transazione:",
        error
      );

      // Gestione messaggi di errore dettagliati
      let errorMessage = "Errore durante la creazione della transazione";

      if (error.response?.data) {
        const responseError = error.response.data;
        if (Array.isArray(responseError.message)) {
          errorMessage = responseError.message.join(", ");
        } else if (typeof responseError.message === "string") {
          errorMessage = responseError.message;
        }
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async (
    { id, data }: { id: string; data: UpdateTransactionData },
    { rejectWithValue }
  ) => {
    try {
      const response = await transactionService.update(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update transaction"
      );
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await transactionService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete transaction"
      );
    }
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setSelectedTransaction: (
      state,
      action: PayloadAction<Transaction | null>
    ) => {
      state.selectedTransaction = action.payload;
    },
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.pagination = initialState.pagination;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactions.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<Transaction>>) => {
          state.isLoading = false;
          state.transactions = action.payload.data;
          state.pagination = action.payload.meta;
        }
      )
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Transaction By Id
      .addCase(fetchTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactionById.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          state.isLoading = false;
          state.selectedTransaction = action.payload;
        }
      )
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          state.isLoading = false;
          state.transactions = [action.payload, ...state.transactions];
          state.pagination.total += 1;
        }
      )
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Transaction
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateTransaction.fulfilled,
        (state, action: PayloadAction<Transaction>) => {
          state.isLoading = false;

          // Update in the transactions list
          const index = state.transactions.findIndex(
            (t) => t.id === action.payload.id
          );
          if (index !== -1) {
            state.transactions[index] = action.payload;
          }

          // Update selected transaction if it's the same
          if (state.selectedTransaction?.id === action.payload.id) {
            state.selectedTransaction = action.payload;
          }
        }
      )
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteTransaction.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.transactions = state.transactions.filter(
            (t) => t.id !== action.payload
          );

          // Clear selected transaction if it's the deleted one
          if (state.selectedTransaction?.id === action.payload) {
            state.selectedTransaction = null;
          }

          state.pagination.total -= 1;
        }
      )
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedTransaction,
  setFilters,
  clearTransactions,
  clearError,
} = transactionSlice.actions;

export default transactionSlice.reducer;
