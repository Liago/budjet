import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionService } from '../../utils/apiServices';
import { 
  CreateTransactionData, 
  PaginatedResponse, 
  Transaction, 
  TransactionFilters, 
  UpdateTransactionData 
} from '../../utils/types';

interface TransactionState {
  transactions: Transaction[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  currentTransaction: Transaction | null;
}

const initialState: TransactionState = {
  transactions: [],
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  isLoading: false,
  error: null,
  currentTransaction: null,
};

// Fetch all transactions with optional filters
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (filters?: TransactionFilters, { rejectWithValue }) => {
    try {
      console.log('fetchTransactions thunk - filtri inviati all\'API:', filters);
      const response = await transactionService.getAll(filters);
      console.log('fetchTransactions thunk - risposta ricevuta dall\'API:', response);
      return response;
    } catch (error: any) {
      console.error('fetchTransactions thunk - errore:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Fetch a single transaction by ID
export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await transactionService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }
);

// Create a new transaction
export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData: CreateTransactionData, { rejectWithValue }) => {
    try {
      return await transactionService.create(transactionData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction');
    }
  }
);

// Update an existing transaction
export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }: { id: string; data: UpdateTransactionData }, { rejectWithValue }) => {
    try {
      return await transactionService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction');
    }
  }
);

// Delete a transaction
export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await transactionService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete transaction');
    }
  }
);

// Delete all transactions
export const deleteAllTransactions = createAsyncThunk(
  'transactions/deleteAll',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const result = await transactionService.deleteAll();
      // Refresh transactions list after delete
      dispatch(fetchTransactions());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete all transactions');
    }
  }
);

// Import transactions from CSV
export const importTransactionsFromCsv = createAsyncThunk(
  'transactions/importFromCsv',
  async (formData: FormData, { rejectWithValue, dispatch }) => {
    try {
      const result = await transactionService.importCsv(formData);
      // Refresh transactions list after import
      dispatch(fetchTransactions());
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to import transactions');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    setCurrentTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.currentTransaction = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<PaginatedResponse<Transaction>>) => {
        state.isLoading = false;
        state.transactions = action.payload.data;
        state.totalItems = action.payload.meta.total;
        state.currentPage = action.payload.meta.page;
        state.totalPages = action.payload.meta.totalPages;
        state.limit = action.payload.meta.limit;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transaction by ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.isLoading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.isLoading = false;
        state.transactions = [action.payload, ...state.transactions];
        state.totalItems += 1;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.isLoading = false;
        state.transactions = state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        );
        state.currentTransaction = action.payload;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.transactions = state.transactions.filter(
          (transaction) => transaction.id !== action.payload
        );
        state.totalItems -= 1;
        if (state.currentTransaction?.id === action.payload) {
          state.currentTransaction = null;
        }
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete all transactions
      .addCase(deleteAllTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteAllTransactions.fulfilled, (state) => {
        state.isLoading = false;
        state.transactions = [];
        state.totalItems = 0;
      })
      .addCase(deleteAllTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Import transactions from CSV
      .addCase(importTransactionsFromCsv.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(importTransactionsFromCsv.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(importTransactionsFromCsv.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactionError, setCurrentTransaction, setPage } = transactionSlice.actions;
export default transactionSlice.reducer; 