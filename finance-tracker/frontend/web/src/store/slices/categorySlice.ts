import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { categoryService } from '../../utils/apiServices';
import { 
  Category, 
  CreateCategoryData, 
  UpdateCategoryData 
} from '../../utils/types';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  currentCategory: Category | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
  currentCategory: null,
};

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getAll();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

// Fetch a single category by ID
export const fetchCategoryById = createAsyncThunk(
  'categories/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await categoryService.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
    }
  }
);

// Create a new category
export const createCategory = createAsyncThunk(
  'categories/create',
  async (categoryData: CreateCategoryData, { rejectWithValue }) => {
    try {
      return await categoryService.create(categoryData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

// Update an existing category
export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: UpdateCategoryData }, { rejectWithValue }) => {
    try {
      return await categoryService.update(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

// Delete a category
export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    setCurrentCategory: (state, action: PayloadAction<Category | null>) => {
      state.currentCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories = [...state.categories, action.payload];
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.isLoading = false;
        state.categories = state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        );
        state.currentCategory = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.categories = state.categories.filter(
          (category) => category.id !== action.payload
        );
        if (state.currentCategory?.id === action.payload) {
          state.currentCategory = null;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoryError, setCurrentCategory } = categorySlice.actions;
export default categorySlice.reducer; 