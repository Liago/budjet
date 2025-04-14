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

// Auth Service
export const authService = {
  login: (credentials: LoginCredentials) =>
    apiService.post<AuthResponse>("/auth/login", credentials),

  register: (userData: RegisterData) =>
    apiService.post<AuthResponse>("/auth/register", userData),

  getCurrentUser: () => apiService.get<User>("/users/me"),

  updateProfile: (userData: Partial<User>) =>
    apiService.patch<User>("/users/me", userData),
};

// Category Service
export const categoryService = {
  getAll: () => apiService.get<Category[]>("/categories"),

  getById: (id: string) => apiService.get<Category>(`/categories/${id}`),

  create: (categoryData: any) =>
    apiService.post<Category>("/categories", categoryData),

  update: (id: string, categoryData: any) =>
    apiService.patch<Category>(`/categories/${id}`, categoryData),

  delete: (id: string) => apiService.delete<void>(`/categories/${id}`),
};

// Transaction Service
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

    return apiService.get<PaginatedResponse<Transaction>>(
      "/transactions",
      formattedFilters
    );
  },

  getById: (id: string) => apiService.get<Transaction>(`/transactions/${id}`),

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
    return apiService.post<Transaction>("/transactions", formattedData);
  },

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
    return apiService.patch<Transaction>(`/transactions/${id}`, formattedData);
  },

  delete: (id: string) => apiService.delete<void>(`/transactions/${id}`),
};

// Dashboard Service
export const dashboardService = {
  // Get dashboard statistics with proper date parameters
  getStats: (startDate?: string, endDate?: string) => {
    console.log("Calling dashboard stats with dates:", { startDate, endDate });
    return apiService.get<DashboardStats>("/dashboard/stats", {
      startDate,
      endDate,
    });
  },

  // Get trend data
  getTrendData: (timeRange = "3m") =>
    apiService.get<any>("/dashboard/trends", { timeRange }),

  // Get budget vs. expense analysis
  getBudgetAnalysis: (timeRange = "1m") =>
    apiService.get<any>("/dashboard/budget-analysis", { timeRange }),
};

// Recurrent Payment Service
export const recurrentPaymentService = {
  getAll: () => apiService.get<RecurrentPayment[]>("/recurrent-payments"),

  getById: (id: string) =>
    apiService.get<RecurrentPayment>(`/recurrent-payments/${id}`),

  create: (paymentData: CreateRecurrentPaymentData) =>
    apiService.post<RecurrentPayment>("/recurrent-payments", paymentData),

  update: (id: string, paymentData: UpdateRecurrentPaymentData) =>
    apiService.patch<RecurrentPayment>(
      `/recurrent-payments/${id}`,
      paymentData
    ),

  delete: (id: string) => apiService.delete<void>(`/recurrent-payments/${id}`),
};

// Savings Goals Service
export const savingsGoalsService = {
  getAll: () => apiService.get<any[]>("/savings-goals"),

  getById: (id: string) => apiService.get<any>(`/savings-goals/${id}`),

  create: (goalData: any) => apiService.post<any>("/savings-goals", goalData),

  update: (id: string, goalData: any) =>
    apiService.patch<any>(`/savings-goals/${id}`, goalData),

  delete: (id: string) => apiService.delete<void>(`/savings-goals/${id}`),

  addAmount: (id: string, amount: number) =>
    apiService.post<any>(`/savings-goals/${id}/add-amount`, { amount }),
};
