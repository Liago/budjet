import { Injectable, Logger } from '@nestjs/common';
import { User, Category, Transaction, Tag } from '@prisma/client';

/**
 * In-memory database service as a fallback when Prisma fails to connect
 * This is a temporary solution for environments where Prisma cannot run properly
 */
@Injectable()
export class InMemoryDbService {
  private readonly logger = new Logger(InMemoryDbService.name);
  
  // In-memory storage
  private users: Map<string, User> = new Map();
  private categories: Map<string, Category> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private tags: Map<string, Tag> = new Map();
  
  constructor() {
    this.logger.log('Initializing in-memory database service as fallback');
  }
  
  // User methods
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = this.generateId();
    const now = new Date();
    const user: User = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }
  
  async findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }
  
  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Category methods
  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const id = this.generateId();
    const now = new Date();
    const category: Category = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.categories.set(id, category);
    return category;
  }
  
  async findCategoriesByUserId(userId: string): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.userId === userId);
  }
  
  async findCategoryById(id: string): Promise<Category | null> {
    return this.categories.get(id) || null;
  }
  
  async updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
    const category = this.categories.get(id);
    if (!category) return null;
    
    const updatedCategory = {
      ...category,
      ...data,
      updatedAt: new Date(),
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Transaction methods
  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const id = this.generateId();
    const now = new Date();
    const transaction: Transaction = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  async findTransactionsByUserId(userId: string, filters?: any): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values()).filter(tx => tx.userId === userId);
    
    // Apply filters if provided
    if (filters) {
      if (filters.type) {
        transactions = transactions.filter(tx => tx.type === filters.type);
      }
      if (filters.categoryId) {
        transactions = transactions.filter(tx => tx.categoryId === filters.categoryId);
      }
      if (filters.startDate) {
        transactions = transactions.filter(tx => new Date(tx.date) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        transactions = transactions.filter(tx => new Date(tx.date) <= new Date(filters.endDate));
      }
    }
    
    return transactions;
  }
  
  async findTransactionById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) || null;
  }
  
  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction | null> {
    const transaction = this.transactions.get(id);
    if (!transaction) return null;
    
    const updatedTransaction = {
      ...transaction,
      ...data,
      updatedAt: new Date(),
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }
  
  // Tag methods
  async createTag(data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    const id = this.generateId();
    const now = new Date();
    const tag: Tag = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.tags.set(id, tag);
    return tag;
  }
  
  async findTagsByUserId(userId: string): Promise<Tag[]> {
    return Array.from(this.tags.values()).filter(tag => tag.userId === userId);
  }
  
  async findTagById(id: string): Promise<Tag | null> {
    return this.tags.get(id) || null;
  }
  
  async updateTag(id: string, data: Partial<Tag>): Promise<Tag | null> {
    const tag = this.tags.get(id);
    if (!tag) return null;
    
    const updatedTag = {
      ...tag,
      ...data,
      updatedAt: new Date(),
    };
    this.tags.set(id, updatedTag);
    return updatedTag;
  }
  
  async deleteTag(id: string): Promise<boolean> {
    return this.tags.delete(id);
  }
  
  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
} 