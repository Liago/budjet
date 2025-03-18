// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  budget?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
  budget?: number;
}

// Transaction Types
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  tags: Tag[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateTransactionData {
  amount: number | string;
  description: string;
  date: string;
  type: TransactionType;
  categoryId: string;
  tags?: string[];
}

export interface UpdateTransactionData {
  amount?: number | string;
  description?: string;
  date?: string;
  type?: TransactionType;
  categoryId?: string;
  tags?: string[];
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalBudget: number;
  budgetRemaining: number;
  budgetPercentage: number;
  categories: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    amount: number;
    percentage: number;
    budget?: number;
    budgetPercentage?: number;
  }[];
  recentTransactions: Transaction[];
}

// Recurrent Payment Types
export type RecurrenceInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrentPayment {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  description?: string;
  interval: RecurrenceInterval;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  nextPaymentDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRecurrentPaymentData {
  name: string;
  amount: number | string;
  categoryId: string;
  description?: string;
  interval: RecurrenceInterval;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateRecurrentPaymentData {
  name?: string;
  amount?: number | string;
  categoryId?: string;
  description?: string;
  interval?: RecurrenceInterval;
  dayOfMonth?: number;
  dayOfWeek?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
} 