import { api } from "./api";
import { Category, TransactionType } from "../types/models";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (
    data: Omit<Category, "id" | "createdAt" | "updatedAt">
  ): Promise<Category> => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  getByType: async (type: TransactionType): Promise<Category[]> => {
    const response = await api.get(`/categories?type=${type}`);
    return response.data;
  },

  getTotalAmount: async (id: string): Promise<number> => {
    const response = await api.get(`/categories/${id}/total`);
    return response.data.total;
  },
};
