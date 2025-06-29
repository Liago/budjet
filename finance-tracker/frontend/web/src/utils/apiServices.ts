import { apiService, API_URL } from "./api";
import {
  AuthResponse,
  Category,
  CreateCategoryData,
  CreateTransactionData,
  DashboardStats,
  LoginCredentials,
  PaginatedResponse,
  RegisterData,
  Transaction,
  TransactionFilters,
  UpdateCategoryData,
  UpdateTransactionData,
  User,
  RecurrentPayment,
  CreateRecurrentPaymentData,
  UpdateRecurrentPaymentData,
  CreateSavingsGoalData,
  UpdateSavingsGoalData,
} from "./types";
import axios from "axios";

// Auth Service
export const authService = {
  login: (credentials: LoginCredentials) => {
    // 🔧 USE DIRECT LOGIN: Bypasses LocalAuthGuard that doesn't work in serverless
    // 🕐 Updated: 2025-06-28 - Using direct-login that works in Netlify Functions
    const loginEndpoint = `${API_URL}/auth/direct-login`; // Bypasses problematic LocalAuthGuard

    console.log("🔍 Login endpoint selection:", {
      API_URL,
      loginEndpoint,
      timestamp: new Date().toISOString(),
    });

    return fetch(loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }).then(async (response) => {
      const data = await response.json();

      console.log("🔍 Login response:", {
        status: response.status,
        ok: response.ok,
        data: data,
        timestamp: new Date().toISOString(),
      });

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle standard NestJS response format
      if (data.accessToken && data.user) {
        return {
          accessToken: data.accessToken,
          user: data.user,
        };
      }

      throw new Error("Invalid response format from login endpoint");
    });
  },

  register: (userData: RegisterData) =>
    apiService.post<AuthResponse>("/auth/register", userData),

  getCurrentUser: () => apiService.get<User>("/direct/users/me"), // 🔧 Use direct endpoint

  updateProfile: (userData: Partial<User>) =>
    apiService.patch<User>("/users/me", userData), // Keep original for updates
};

// Category Service
export const categoryService = {
  getAll: () => apiService.get<Category[]>("/direct/categories"), // 🔧 Use direct endpoint

  getById: (id: string) => apiService.get<Category>(`/categories/${id}`),

  create: (categoryData: CreateCategoryData) =>
    apiService.post<Category>("/categories", categoryData),

  update: (id: string, categoryData: UpdateCategoryData) =>
    apiService.patch<Category>(`/categories/${id}`, categoryData),

  delete: (id: string) => apiService.delete<void>(`/categories/${id}`),
};

// Transaction Service
export const transactionService = {
  getAll: (filters?: TransactionFilters) =>
    apiService.get<PaginatedResponse<Transaction>>(
      "/direct/transactions",
      filters
    ), // 🔧 Use direct endpoint

  getById: (id: string) => apiService.get<Transaction>(`/transactions/${id}`),

  create: (transactionData: CreateTransactionData) =>
    apiService.post<Transaction>("/transactions", transactionData),

  update: (id: string, transactionData: UpdateTransactionData) =>
    apiService.patch<Transaction>(`/transactions/${id}`, transactionData),

  delete: (id: string) => apiService.delete<void>(`/transactions/${id}`),

  // Aggiorna multiple transazioni contemporaneamente
  bulkUpdate: (ids: string[], updateData: Partial<UpdateTransactionData>) =>
    apiService.post<{ success: boolean; count: number }>(
      "/transactions/bulk-update",
      {
        ids,
        data: updateData,
      }
    ),

  importCsv: (formData: FormData) =>
    apiService.upload<{
      success: boolean;
      count: number;
      transactions: Transaction[];
    }>("/transactions/import/csv", formData),
};

// Dashboard Service
export const dashboardService = {
  // Ottieni le statistiche del dashboard
  getStats: async (startDate?: string, endDate?: string) => {
    const params = { startDate, endDate };
    const response = await apiService.get("/direct/stats", params); // 🔧 Use direct endpoint
    return response;
  },

  // Ottieni i dati di trend
  getTrendData: async (timeRange = "3m") => {
    const response = await apiService.get(`/dashboard/trends`, { timeRange });
    return response;
  },

  // Ottieni l'analisi budget vs spesa
  getBudgetAnalysis: async (timeRange = "1m") => {
    console.log("Chiamata getBudgetAnalysis con timeRange:", timeRange);
    const response = await apiService.get(`/dashboard/budget-analysis`, {
      timeRange,
    });
    return response;
  },

  // Nuovo endpoint per l'analisi predittiva
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
    }>("/dashboard/forecast", { months }),

  // Nuovo endpoint per i suggerimenti di risparmio
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
    }>("/dashboard/savings"),
};

// Recurrent Payment Service
export const recurrentPaymentService = {
  getAll: () =>
    apiService.get<RecurrentPayment[]>("/direct/recurrent-payments"), // 🔧 Use direct endpoint

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

  // 🔧 NEW: Last execution endpoint (direct)
  getLastExecution: () =>
    apiService.get("/direct/recurrent-payments/last-execution"),

  // 🔧 NEW: Execute recurrent payments (direct)
  execute: () => apiService.post("/direct/recurrent-payments/execute", {}),
};

// SavingsGoals service methods
export const savingsGoalsService = {
  // Ottieni tutti gli obiettivi di risparmio dell'utente
  getAll: async () => {
    const response = await apiService.get("/savings-goals");
    return response;
  },

  // Crea un nuovo obiettivo di risparmio
  create: async (data: CreateSavingsGoalData) => {
    const response = await apiService.post("/savings-goals", data);
    return response;
  },

  // Aggiorna un obiettivo di risparmio esistente
  update: async (id: string, data: UpdateSavingsGoalData) => {
    const response = await apiService.patch(`/savings-goals/${id}`, data);
    return response;
  },

  // Elimina un obiettivo di risparmio
  delete: async (id: string) => {
    const response = await apiService.delete(`/savings-goals/${id}`);
    return response;
  },

  // Aggiungi un importo a un obiettivo di risparmio
  addAmount: async (id: string, amount: number) => {
    const response = await apiService.post(`/savings-goals/${id}/add-amount`, {
      amount,
    });
    return response;
  },
};
