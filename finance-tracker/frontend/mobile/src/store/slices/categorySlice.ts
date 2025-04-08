import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { categoryService } from "../../api/services";
import { Category } from "../../types";

interface CategoryState {
  categories: Category[];
  selectedCategory: Category | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Chiamata fetchCategories iniziata");
      const response = await categoryService.getAll();
      console.log(
        "Chiamata fetchCategories completata con successo:",
        response
      );
      return response;
    } catch (error: any) {
      console.error("Errore in fetchCategories:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  "categories/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await categoryService.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category"
      );
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (categoryData: any, { rejectWithValue }) => {
    try {
      const response = await categoryService.create(categoryData);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create category"
      );
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await categoryService.update(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update category"
      );
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await categoryService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

export const fetchCategoriesByType = createAsyncThunk(
  "categories/fetchByType",
  async (type: "INCOME" | "EXPENSE", { rejectWithValue }) => {
    try {
      console.log(`Fetching categories with type ${type}`);
      const response = await categoryService.getAll();

      // Mappa di categorie comuni per tipo per l'inferenza
      const expenseCategories = [
        "grocery",
        "alimentari",
        "spesa",
        "bar",
        "restaurant",
        "ristorante",
        "car",
        "auto",
        "transport",
        "trasporti",
        "health",
        "salute",
        "home",
        "casa",
        "utilities",
        "bollette",
        "pets",
        "animali",
        "shopping",
        "acquisti",
        "technology",
        "tecnologia",
        "taxes",
        "tasse",
      ];

      const incomeCategories = [
        "salary",
        "stipendio",
        "bonus",
        "gift",
        "regalo",
        "investment",
        "investimento",
        "refund",
        "rimborso",
        "special",
        "speciale",
      ];

      // Filtra le categorie in base al tipo esplicito o inferito
      const filteredCategories = response.filter((category) => {
        // Se la categoria ha un tipo esplicito
        if (category.type) {
          return category.type.toUpperCase() === type.toUpperCase();
        }

        // Altrimenti, inferiamo il tipo dal nome della categoria
        const categoryName = (category.name || "").toLowerCase();

        // Verifica se è una categoria di spesa o entrata in base al nome
        if (type === "EXPENSE") {
          return (
            expenseCategories.some((name) =>
              categoryName.includes(name.toLowerCase())
            ) || categoryName.includes("uncategorized")
          );
        } else {
          return incomeCategories.some((name) =>
            categoryName.includes(name.toLowerCase())
          );
        }
      });

      console.log(
        `Found ${filteredCategories.length} categories of type ${type}`
      );
      return filteredCategories;
    } catch (error: any) {
      console.error("Error in fetchCategoriesByType:", error);
      return rejectWithValue(
        error.response?.data?.message || `Failed to fetch ${type} categories`
      );
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.isLoading = false;
          state.categories = action.payload;
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Category By Id
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCategoryById.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.isLoading = false;
          state.selectedCategory = action.payload;
        }
      )
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.isLoading = false;
          state.categories = [...state.categories, action.payload];
        }
      )
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.isLoading = false;

          // Update in the categories list
          const index = state.categories.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) {
            state.categories[index] = action.payload;
          }

          // Update selected category if it's the same
          if (state.selectedCategory?.id === action.payload.id) {
            state.selectedCategory = action.payload;
          }
        }
      )
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.categories = state.categories.filter(
            (c) => c.id !== action.payload
          );

          // Clear selected category if it's the deleted one
          if (state.selectedCategory?.id === action.payload) {
            state.selectedCategory = null;
          }
        }
      )
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Categories By Type
      .addCase(fetchCategoriesByType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCategoriesByType.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.isLoading = false;
          state.categories = action.payload;
        }
      )
      .addCase(fetchCategoriesByType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategory, clearError } = categorySlice.actions;
export default categorySlice.reducer;
