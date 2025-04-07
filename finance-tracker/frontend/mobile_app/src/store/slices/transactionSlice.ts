import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionService } from "../../services/transaction-service";
import { Transaction, TransactionType } from "../../types/models";

interface TransactionState {
  transactions: Transaction[];
  monthlySummary: {
    income: number;
    expenses: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  monthlySummary: {
    income: 0,
    expenses: 0,
  },
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchAll",
  async () => {
    const transactions = await transactionService.getAll();
    const monthlySummary = await transactionService.getMonthlySummary();
    return { transactions, monthlySummary };
  }
);

export const addTransaction = createAsyncThunk(
  "transactions/add",
  async (transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => {
    return await transactionService.create(transaction);
  }
);

export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
    return await transactionService.update(id, data);
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id: string) => {
    await transactionService.delete(id);
    return id;
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.monthlySummary = action.payload.monthlySummary;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch transactions";
      })
      // Add transaction
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.push(action.payload);
      })
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.id
        );
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.payload
        );
      });
  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
