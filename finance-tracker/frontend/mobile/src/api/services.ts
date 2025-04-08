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
  getAll: (filters?: TransactionFilters) =>
    apiService.get<PaginatedResponse<Transaction>>("/transactions", filters),

  getById: (id: string) => apiService.get<Transaction>(`/transactions/${id}`),

  create: (transactionData: CreateTransactionData) =>
    apiService.post<Transaction>("/transactions", transactionData),

  update: (id: string, transactionData: UpdateTransactionData) =>
    apiService.patch<Transaction>(`/transactions/${id}`, transactionData),

  delete: (id: string) => apiService.delete<void>(`/transactions/${id}`),
};

// Dashboard Service
export const dashboardService = {
  // Get dashboard statistics
  getStats: (startDate?: string, endDate?: string) =>
    apiService.get<DashboardStats>("/dashboard/stats", { startDate, endDate }),

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
