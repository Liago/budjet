import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService } from "../../services/category-service";
import { Category, TransactionType } from "../../types/models";

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async () => {
    return await categoryService.getAll();
  }
);

export const addCategory = createAsyncThunk(
  "categories/add",
  async (category: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    return await categoryService.create(category);
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }: { id: string; data: Partial<Category> }) => {
    return await categoryService.update(id, data);
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string) => {
    await categoryService.delete(id);
    return id;
  }
);

export const fetchCategoriesByType = createAsyncThunk(
  "categories/fetchByType",
  async (type: TransactionType) => {
    return await categoryService.getByType(type);
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      // Add category
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
      })
      // Fetch categories by type
      .addCase(fetchCategoriesByType.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;
