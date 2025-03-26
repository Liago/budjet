export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
  TRANSFER = "transfer",
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO date string
  type: TransactionType;
  categoryId: string;
  category?: Category;
  accountId: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  categoryId?: string;
  startDate: string;
  endDate: string;
  color?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color?: string;
  icon?: string;
  note?: string;
}
