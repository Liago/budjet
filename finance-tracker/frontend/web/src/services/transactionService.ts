import api from './api';
import { CreateTransactionData, Transaction, TransactionFilters, UpdateTransactionData } from '../utils/types';

const BASE_URL = '/transactions';

const transactionService = {
  getAll: async (filters?: TransactionFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.type) params.append('type', filters.type);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.tag) params.append('tag', filters.tag);
    }
    
    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },
  
  create: async (data: CreateTransactionData) => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },
  
  update: async (id: string, data: UpdateTransactionData) => {
    const response = await api.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
  
  deleteAll: async () => {
    try {
      // Try different methods to delete all transactions
      let error;

      // Method 1: Try the POST endpoint
      try {
        console.log('Attempting delete-all with POST method');
        const response = await api.post(`${BASE_URL}/delete-all`);
        return response.data;
      } catch (err) {
        console.error('POST /delete-all failed:', err);
        error = err;
      }

      // Method 2: Try the DELETE endpoint
      try {
        console.log('Attempting delete-all with DELETE method');
        const response = await api.delete(`${BASE_URL}/all`);
        return response.data;
      } catch (err) {
        console.error('DELETE /all failed:', err);
        error = err;
      }

      // Method 3: Try raw fetch to rule out axios issues
      try {
        console.log('Attempting delete-all with raw fetch');
        const apiUrl = `${api.defaults.baseURL || ''}${BASE_URL}/delete-all`;
        const token = localStorage.getItem('token');
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (err) {
        console.error('Raw fetch failed:', err);
        error = err;
      }

      // Method 4: Get all transaction IDs and delete them in batch
      try {
        console.log('Attempting batch delete approach');
        // First get all transactions to get their IDs
        const allTransactionsResponse = await api.get(`${BASE_URL}?limit=1000`);
        const transactions = allTransactionsResponse.data.data;
        
        if (transactions.length === 0) {
          return { success: true, message: 'No transactions to delete', count: 0 };
        }
        
        const ids = transactions.map(t => t.id);
        console.log(`Found ${ids.length} transactions to delete`);
        
        // Delete in batch
        const batchResponse = await api.post(`${BASE_URL}/delete-batch`, { ids });
        return batchResponse.data;
      } catch (err) {
        console.error('Batch delete failed:', err);
        error = err;
      }

      // If all methods failed, throw the original error
      throw error || new Error('All delete methods failed');
    } catch (error) {
      console.error('Delete all error details:', error);
      throw error;
    }
  },
  
  importCsv: async (formData: FormData) => {
    const response = await api.post(`${BASE_URL}/import/csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default transactionService; 