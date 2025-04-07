export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  description: string;
  categoryId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardData {
  currentBalance: number;
  monthlySummary: MonthlySummary;
  recentTransactions: Transaction[];
}
