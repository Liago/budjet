import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  RecurrentPayment,
  CreateRecurrentPaymentData,
  UpdateRecurrentPaymentData
} from '../../utils/types';
import { recurrentPaymentService } from '../../utils/apiServices';

interface RecurrentPaymentState {
  recurrentPayments: RecurrentPayment[];
  isLoading: boolean;
  error: string | null;
  currentRecurrentPayment: RecurrentPayment | null;
}

const initialState: RecurrentPaymentState = {
  recurrentPayments: [],
  isLoading: false,
  error: null,
  currentRecurrentPayment: null
};

// Thunk per recuperare tutti i pagamenti ricorrenti
export const fetchRecurrentPayments = createAsyncThunk(
  'recurrentPayments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await recurrentPaymentService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recurrent payments');
    }
  }
);

// Thunk per recuperare un pagamento ricorrente specifico per ID
export const fetchRecurrentPaymentById = createAsyncThunk(
  'recurrentPayments/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await recurrentPaymentService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recurrent payment');
    }
  }
);

// Thunk per creare un nuovo pagamento ricorrente
export const createRecurrentPayment = createAsyncThunk(
  'recurrentPayments/create',
  async (data: CreateRecurrentPaymentData, { rejectWithValue }) => {
    try {
      return await recurrentPaymentService.create(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create recurrent payment');
    }
  }
);

// Thunk per aggiornare un pagamento ricorrente esistente
export const updateRecurrentPayment = createAsyncThunk(
  'recurrentPayments/update',
  async ({ id, data }: { id: string; data: UpdateRecurrentPaymentData }, { rejectWithValue }) => {
    try {
      return await recurrentPaymentService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update recurrent payment');
    }
  }
);

// Thunk per eliminare un pagamento ricorrente
export const deleteRecurrentPayment = createAsyncThunk(
  'recurrentPayments/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await recurrentPaymentService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete recurrent payment');
    }
  }
);

// Slice per i pagamenti ricorrenti
const recurrentPaymentSlice = createSlice({
  name: 'recurrentPayments',
  initialState,
  reducers: {
    clearRecurrentPaymentError: (state) => {
      state.error = null;
    },
    setCurrentRecurrentPayment: (state, action: PayloadAction<RecurrentPayment | null>) => {
      state.currentRecurrentPayment = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchRecurrentPayments
      .addCase(fetchRecurrentPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecurrentPayments.fulfilled, (state, action: PayloadAction<RecurrentPayment[]>) => {
        state.isLoading = false;
        state.recurrentPayments = action.payload;
      })
      .addCase(fetchRecurrentPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // fetchRecurrentPaymentById
      .addCase(fetchRecurrentPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecurrentPaymentById.fulfilled, (state, action: PayloadAction<RecurrentPayment>) => {
        state.isLoading = false;
        state.currentRecurrentPayment = action.payload;
      })
      .addCase(fetchRecurrentPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // createRecurrentPayment
      .addCase(createRecurrentPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRecurrentPayment.fulfilled, (state, action: PayloadAction<RecurrentPayment>) => {
        state.isLoading = false;
        state.recurrentPayments.push(action.payload);
      })
      .addCase(createRecurrentPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // updateRecurrentPayment
      .addCase(updateRecurrentPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRecurrentPayment.fulfilled, (state, action: PayloadAction<RecurrentPayment>) => {
        state.isLoading = false;
        const index = state.recurrentPayments.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.recurrentPayments[index] = action.payload;
        }
        state.currentRecurrentPayment = action.payload;
      })
      .addCase(updateRecurrentPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // deleteRecurrentPayment
      .addCase(deleteRecurrentPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRecurrentPayment.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.recurrentPayments = state.recurrentPayments.filter(p => p.id !== action.payload);
        if (state.currentRecurrentPayment?.id === action.payload) {
          state.currentRecurrentPayment = null;
        }
      })
      .addCase(deleteRecurrentPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearRecurrentPaymentError, setCurrentRecurrentPayment } = recurrentPaymentSlice.actions;

export default recurrentPaymentSlice.reducer; 