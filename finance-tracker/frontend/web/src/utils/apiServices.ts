import { apiService } from './api';
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
} from './types';

// Auth Service
export const authService = {
  login: (credentials: LoginCredentials) => 
    apiService.post<AuthResponse>('/auth/login', credentials),
  
  register: (userData: RegisterData) => 
    apiService.post<AuthResponse>('/auth/register', userData),
  
  getCurrentUser: () => 
    apiService.get<User>('/users/me'),
  
  updateProfile: (userData: Partial<User>) => 
    apiService.patch<User>('/users/me', userData),
};

// Category Service
export const categoryService = {
  getAll: () => 
    apiService.get<Category[]>('/categories'),
  
  getById: (id: string) => 
    apiService.get<Category>(`/categories/${id}`),
  
  create: (categoryData: CreateCategoryData) => 
    apiService.post<Category>('/categories', categoryData),
  
  update: (id: string, categoryData: UpdateCategoryData) => 
    apiService.patch<Category>(`/categories/${id}`, categoryData),
  
  delete: (id: string) => 
    apiService.delete<void>(`/categories/${id}`),
};

// Transaction Service
export const transactionService = {
  getAll: (filters?: TransactionFilters) => 
    apiService.get<PaginatedResponse<Transaction>>('/transactions', filters),
  
  getById: (id: string) => 
    apiService.get<Transaction>(`/transactions/${id}`),
  
  create: (transactionData: CreateTransactionData) => 
    apiService.post<Transaction>('/transactions', transactionData),
  
  update: (id: string, transactionData: UpdateTransactionData) => 
    apiService.patch<Transaction>(`/transactions/${id}`, transactionData),
  
  delete: (id: string) => 
    apiService.delete<void>(`/transactions/${id}`),
  
  importCsv: (formData: FormData) => 
    apiService.upload<{ success: boolean; count: number; transactions: Transaction[] }>('/transactions/import/csv', formData),
};

// Dashboard Service
export const dashboardService = {
  getStats: (startDate?: string, endDate?: string) => 
    apiService.get<DashboardStats>('/dashboard/stats', { startDate, endDate }),
};

// Recurrent Payment Service
export const recurrentPaymentService = {
  getAll: () => 
    apiService.get<RecurrentPayment[]>('/recurrent-payments'),
  
  getById: (id: string) => 
    apiService.get<RecurrentPayment>(`/recurrent-payments/${id}`),
  
  create: (paymentData: CreateRecurrentPaymentData) => 
    apiService.post<RecurrentPayment>('/recurrent-payments', paymentData),
  
  update: (id: string, paymentData: UpdateRecurrentPaymentData) => 
    apiService.patch<RecurrentPayment>(`/recurrent-payments/${id}`, paymentData),
  
  delete: (id: string) => 
    apiService.delete<void>(`/recurrent-payments/${id}`),
}; 