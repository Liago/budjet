import { api } from "./api";
import { Transaction, TransactionType } from "../types/models";

export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get("/transactions");
    return response.data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ): Promise<Transaction> => {
    const response = await api.post("/transactions", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Transaction>
  ): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  getMonthlySummary: async (): Promise<{
    income: number;
    expenses: number;
  }> => {
    const response = await api.get("/transactions/monthly-summary");
    return response.data;
  },

  getByType: async (type: TransactionType): Promise<Transaction[]> => {
    const response = await api.get(`/transactions?type=${type}`);
    return response.data;
  },

  getByCategory: async (categoryId: string): Promise<Transaction[]> => {
    const response = await api.get(`/transactions?categoryId=${categoryId}`);
    return response.data;
  },
};
