import { apiService } from "./api";
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Category,
  Transaction,
  TransactionFilters,
  PaginatedResponse,
  CreateTransactionData,
  UpdateTransactionData,
  RecurrentPayment,
  CreateRecurrentPaymentData,
  UpdateRecurrentPaymentData,
  DashboardStats,
} from "../types";

// Auth Service - 🔧 UPDATED: Allineato al web frontend
export const authService = {
  // 🔧 UPDATED: Usa direct-login endpoint come il web
  login: (credentials: LoginCredentials) => {
    console.log("🔍 Using direct-login endpoint for authentication");
    return apiService.post<AuthResponse>("/auth/direct-login", credentials);
  },

  register: (userData: RegisterData) =>
    apiService.post<AuthResponse>("/auth/register", userData),

  // 🔧 UPDATED: Usa direct endpoint
  getCurrentUser: () => apiService.get<User>("/direct/users/me"),

  // 🔧 UPDATED: Usa direct endpoint
  updateProfile: (userData: Partial<User>) =>
    apiService.patch<User>("/direct/users/me", userData),
};

// Category Service - 🔧 UPDATED: Allineato al web frontend
export const categoryService = {
  // 🔧 UPDATED: Usa direct endpoint
  getAll: () => apiService.get<Category[]>("/direct/categories"),

  getById: (id: string) => apiService.get<Category>(`/direct/categories/${id}`),

  // 🔧 UPDATED: Usa direct endpoint
  create: (categoryData: any) =>
    apiService.post<Category>("/direct/categories", categoryData),

  // 🔧 UPDATED: Usa direct endpoint
  update: (id: string, categoryData: any) =>
    apiService.patch<Category>(`/direct/categories/${id}`, categoryData),

  // 🔧 UPDATED: Usa direct endpoint
  delete: (id: string) => apiService.delete<void>(`/direct/categories/${id}`),
};

// Transaction Service - 🔧 UPDATED: Allineato al web frontend
export const transactionService = {
  getAll: (filters?: TransactionFilters) => {
    // Crea una copia del filtro per non modificare l'originale
    let formattedFilters = { ...filters };

    // Log dei filtri originali per debug
    console.log("Filtri originali:", filters);

    // Assicuriamoci che tutti i parametri undefined vengano rimossi
    Object.keys(formattedFilters).forEach((key) => {
      if (formattedFilters[key as keyof TransactionFilters] === undefined) {
        delete formattedFilters[key as keyof TransactionFilters];
      }
    });

    // Conversione del parametro month in startDate e endDate
    // Il backend NON accetta il parametro "month" (errore 400)
    if (formattedFilters.month) {
      const month = formattedFilters.month;
      const currentYear = new Date().getFullYear();

      // Determina l'anno-mese
      let yearMonth: string;
      if (month.length === 2) {
        yearMonth = `${currentYear}-${month}`;
      } else {
        yearMonth = month; // Già nel formato corretto
      }

      // Calcola il primo giorno del mese
      const startDate = `${yearMonth}-01`;

      // Calcola l'ultimo giorno del mese
      const [year, monthNum] = yearMonth.split("-").map((n) => parseInt(n));
      // Creiamo una data al primo giorno del mese successivo e sottraiamo 1 giorno
      const lastDay = new Date(year, monthNum, 0).getDate();
      const endDate = `${yearMonth}-${lastDay}`;

      // Aggiorna i filtri con le date calcolate
      formattedFilters.startDate = startDate;
      formattedFilters.endDate = endDate;

      // Rimuovi il parametro month che non è supportato dal backend
      delete formattedFilters.month;

      console.log(`Convertito mese ${month} in intervallo date:`, {
        startDate,
        endDate,
      });
    }

    // Conversione esplicita di parametri numerici
    if (formattedFilters.page) {
      formattedFilters.page = Number(formattedFilters.page);
    }

    if (formattedFilters.limit) {
      formattedFilters.limit = Number(formattedFilters.limit);
    }

    // Rimuovi i parametri di ordinamento se non necessari o se causano problemi
    if (formattedFilters.sortBy && formattedFilters.sortDirection) {
      delete formattedFilters.sortBy;
      delete formattedFilters.sortDirection;
    }

    console.log(
      "Fetching transactions with formatted filters:",
      formattedFilters
    );

    // 🔧 UPDATED: Usa direct endpoint
    return apiService.get<PaginatedResponse<Transaction>>(
      "/direct/transactions",
      formattedFilters
    );
  },

  // 🔧 UPDATED: Usa direct endpoint
  getById: (id: string) =>
    apiService.get<Transaction>(`/direct/transactions/${id}`),

  // 🔧 UPDATED: Usa direct endpoint
  create: (transactionData: CreateTransactionData) => {
    // Crea una copia dei dati
    const formattedData = { ...transactionData };

    // Assicuriamoci che amount sia un numero con esattamente 2 decimali
    // Convertiamolo in stringa per rispettare il formato richiesto dall'API
    if (typeof formattedData.amount !== "number") {
      console.error("Errore: amount deve essere un numero");
    } else {
      // Convertiamo il numero in stringa con 2 decimali
      formattedData.amount = formattedData.amount.toFixed(2);
    }

    console.log("Invio transazione al server:", formattedData);
    return apiService.post<Transaction>("/direct/transactions", formattedData);
  },

  // 🔧 UPDATED: Usa direct endpoint
  update: (id: string, transactionData: UpdateTransactionData) => {
    // Crea una copia dei dati
    const formattedData = { ...transactionData };

    // Assicuriamoci che amount sia un numero con esattamente 2 decimali
    // Convertiamolo in stringa per rispettare il formato richiesto dall'API
    if (transactionData.amount !== undefined) {
      if (typeof formattedData.amount !== "number") {
        console.error("Errore: amount deve essere un numero");
      } else {
        // Convertiamo il numero in stringa con 2 decimali
        formattedData.amount = formattedData.amount.toFixed(2);
      }
    }

    console.log("Aggiornamento transazione:", id, formattedData);
    return apiService.patch<Transaction>(
      `/direct/transactions/${id}`,
      formattedData
    );
  },

  // 🔧 UPDATED: Usa direct endpoint
  delete: (id: string) => apiService.delete<void>(`/direct/transactions/${id}`),

  // 🔧 NEW: Aggiunto bulk update come nel web
  bulkUpdate: (ids: string[], updateData: Partial<UpdateTransactionData>) =>
    apiService.post<{ success: boolean; count: number }>(
      "/direct/transactions/bulk-update",
      {
        ids,
        data: updateData,
      }
    ),

  // 🔧 NEW: Aggiunto CSV import come nel web
  importCsv: (payload: { csvData: string; defaultCategoryId?: string }) =>
    apiService.post<{
      success: boolean;
      count: number;
      transactions: Transaction[];
    }>("/direct/transactions/import/csv", payload),
};

// Dashboard Service - 🔧 UPDATED: Allineato al web frontend
export const dashboardService = {
  // 🔧 UPDATED: Usa direct endpoint
  getStats: (startDate?: string, endDate?: string) => {
    console.log("🔍 [DEBUG] dashboardService.getStats called with:", {
      startDate,
      endDate,
    });

    // Verifica formato date
    if (startDate) {
      console.log("📅 [DEBUG] startDate format check:", {
        original: startDate,
        isValidFormat: /^\d{4}-\d{2}-\d{2}$/.test(startDate),
        parsed: new Date(startDate).toISOString(),
      });
    }

    if (endDate) {
      console.log("📅 [DEBUG] endDate format check:", {
        original: endDate,
        isValidFormat: /^\d{4}-\d{2}-\d{2}$/.test(endDate),
        parsed: new Date(endDate).toISOString(),
      });
    }

    console.log("📞 [DEBUG] Making API call to /direct/stats");
    return apiService
      .get<DashboardStats>("/direct/stats", {
        startDate,
        endDate,
      })
      .then((response) => {
        console.log("✅ [DEBUG] dashboardService.getStats response:", {
          hasResponse: !!response,
          responseType: typeof response,
          keys: response ? Object.keys(response) : [],
          totalIncome: response?.totalIncome,
          totalExpense: response?.totalExpense,
          balance: response?.balance,
          recentTransactionsCount: response?.recentTransactions?.length || 0,
          fullResponse: response,
        });
        return response;
      })
      .catch((error) => {
        console.error("❌ [DEBUG] dashboardService.getStats error:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params,
          },
        });
        throw error;
      });
  },

  // 🔧 UPDATED: Usa direct endpoint
  getTrendData: (timeRange = "3m") =>
    apiService.get<any>("/direct/dashboard/trends", { timeRange }),

  // 🔧 UPDATED: Usa direct endpoint
  getBudgetAnalysis: (timeRange = "1m") =>
    apiService.get<any>("/direct/dashboard/budget-analysis", { timeRange }),

  // 🔧 NEW: Aggiunto come nel web
  getCategorySpending: async (startDate?: string, endDate?: string) => {
    const params = { startDate, endDate };
    const response = await apiService.get("/direct/category-spending", params);
    return response;
  },

  // 🔧 NEW: Aggiunto come nel web
  getRecentTransactions: async (limit: number = 5) => {
    const response = await apiService.get("/direct/recent-transactions", {
      limit,
    });
    return response;
  },

  // 🔧 NEW: Aggiunto come nel web
  getForecastData: (months: number = 6) =>
    apiService.get<{
      historicalData: {
        period: string;
        value: number;
        forecast: boolean;
      }[];
      forecastData: {
        period: string;
        value: number;
        forecast: boolean;
      }[];
      averageIncome: number;
      averageExpense: number;
    }>("/direct/dashboard/forecast", { months }),

  // 🔧 NEW: Aggiunto come nel web
  getExpenseForecast: (startDate?: string, endDate?: string) =>
    apiService.get<{
      actualExpenses: number;
      recurringForecast: number;
      totalForecast: number;
      recurringDetails: Array<{
        id: string;
        name: string;
        amount: number;
        category: string;
        categoryColor: string;
        interval: string;
        nextPaymentDate: string;
      }>;
      period: {
        startDate: string;
        endDate: string;
      };
    }>("/direct/dashboard/expense-forecast", { startDate, endDate }),

  // 🔧 NEW: Aggiunto come nel web
  getSavingSuggestions: () =>
    apiService.get<{
      suggestions: {
        id: string;
        category: string;
        categoryColor: string;
        description: string;
        potentialSaving: number;
        type:
          | "spending_reduction"
          | "automation"
          | "debt_management"
          | "subscription";
        difficulty: "easy" | "medium" | "hard";
        impact: "low" | "medium" | "high";
      }[];
      averageIncome: number;
      averageExpense: number;
      potentialMonthlySavings: number;
      yearlyProjection: number;
    }>("/direct/dashboard/savings"),
};

// Recurrent Payment Service - 🔧 UPDATED: Allineato al web frontend
export const recurrentPaymentService = {
  // 🔧 UPDATED: Usa direct endpoint
  getAll: () =>
    apiService.get<RecurrentPayment[]>("/direct/recurrent-payments"),

  // 🔧 UPDATED: Usa direct endpoint
  getById: (id: string) =>
    apiService.get<RecurrentPayment>(`/direct/recurrent-payments/${id}`),

  // 🔧 UPDATED: Usa direct endpoint
  create: (paymentData: CreateRecurrentPaymentData) =>
    apiService.post<RecurrentPayment>(
      "/direct/recurrent-payments",
      paymentData
    ),

  // 🔧 UPDATED: Usa direct endpoint
  update: (id: string, paymentData: UpdateRecurrentPaymentData) =>
    apiService.patch<RecurrentPayment>(
      `/direct/recurrent-payments/${id}`,
      paymentData
    ),

  // 🔧 UPDATED: Usa direct endpoint
  delete: (id: string) =>
    apiService.delete<void>(`/direct/recurrent-payments/${id}`),

  // 🔧 NEW: Aggiunto come nel web
  getLastExecution: () =>
    apiService.get("/direct/recurrent-payments/last-execution"),

  // 🔧 NEW: Aggiunto come nel web
  execute: () => apiService.post("/direct/recurrent-payments/execute", {}),
};

// Savings Goals Service - 🔧 UPDATED: Allineato al web frontend
export const savingsGoalsService = {
  // 🔧 UPDATED: Usa direct endpoint
  getAll: () => apiService.get<any[]>("/direct/savings-goals"),

  // 🔧 UPDATED: Usa direct endpoint
  getById: (id: string) => apiService.get<any>(`/direct/savings-goals/${id}`),

  // 🔧 UPDATED: Usa direct endpoint
  create: (goalData: any) =>
    apiService.post<any>("/direct/savings-goals", goalData),

  // 🔧 UPDATED: Usa direct endpoint
  update: (id: string, goalData: any) =>
    apiService.patch<any>(`/direct/savings-goals/${id}`, goalData),

  // 🔧 UPDATED: Usa direct endpoint
  delete: (id: string) =>
    apiService.delete<void>(`/direct/savings-goals/${id}`),

  // 🔧 UPDATED: Usa direct endpoint
  addAmount: (id: string, amount: number) =>
    apiService.post<any>(`/direct/savings-goals/${id}/add-amount`, { amount }),
};
