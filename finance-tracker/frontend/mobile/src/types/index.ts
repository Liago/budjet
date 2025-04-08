// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Category types
export interface Category {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

// Transaction types
export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  categoryId: string;
  category?: Category;
  type: "INCOME" | "EXPENSE";
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  amount: number | string;
  date: string;
  description: string;
  categoryId: string;
  type: "INCOME" | "EXPENSE";
  tags?: string[];
}

export interface UpdateTransactionData {
  amount?: number | string;
  date?: string;
  description?: string;
  categoryId?: string;
  type?: "INCOME" | "EXPENSE";
  tags?: string[];
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryIds?: string[];
  type?: "INCOME" | "EXPENSE";
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Dashboard
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
  budgetStatus: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    budget: number;
    spent: number;
    remaining: number;
    percentage: number;
  }[];
}

// Recurrent Payments
export interface RecurrentPayment {
  id: string;
  name: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  category?: Category;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate?: string;
  lastExecuted?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurrentPaymentData {
  name: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  categoryId: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface UpdateRecurrentPaymentData {
  name?: string;
  amount?: number;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate?: string;
  endDate?: string;
  description?: string;
}

// Savings Goals
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
  color: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  deadline?: string;
  icon?: string;
  color: string;
}

export interface UpdateSavingsGoalData {
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  deadline?: string;
  icon?: string;
  color?: string;
}
