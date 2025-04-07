import React, { createContext, useContext, ReactNode } from 'react';
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Transaction {
  id: string;
  budgetId: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  isExpense: boolean;
}

export interface Budget {
  id: string;
  name: string;
  limit: number;
  currentAmount: number;
  colorTag: string;
  icon: string;
  startDate: Date;
  endDate: Date;
}

interface BudJetState {
  budgets: Budget[];
  transactions: Transaction[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
  
  // Azioni per i budget
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budgetData: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Azioni per le transazioni
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transactionData: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Azioni per gli errori
  setError: (message: string) => void;
  clearError: () => void;
  
  // Azioni per il caricamento
  setLoading: (isLoading: boolean) => void;
}

export const useBudJetStore = create<BudJetState>((set) => ({
  budgets: [],
  transactions: [],
  isLoading: false,
  hasError: false,
  errorMessage: '',
  
  // Implementazione delle azioni per i budget
  addBudget: (budget) => set((state) => ({
    budgets: [...state.budgets, { ...budget, id: uuidv4() }],
  })),
  
  updateBudget: (id, budgetData) => set((state) => ({
    budgets: state.budgets.map((budget) => 
      budget.id === id ? { ...budget, ...budgetData } : budget
    ),
  })),
  
  deleteBudget: (id) => set((state) => ({
    budgets: state.budgets.filter((budget) => budget.id !== id),
    // Rimuoviamo anche tutte le transazioni associate a questo budget
    transactions: state.transactions.filter((transaction) => transaction.budgetId !== id),
  })),
  
  // Implementazione delle azioni per le transazioni
  addTransaction: (transaction) => set((state) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    
    // Aggiorniamo il currentAmount del budget associato
    const updatedBudgets = state.budgets.map((budget) => {
      if (budget.id === transaction.budgetId) {
        const amountChange = transaction.isExpense ? -transaction.amount : transaction.amount;
        return {
          ...budget,
          currentAmount: budget.currentAmount + amountChange,
        };
      }
      return budget;
    });
    
    return {
      transactions: [...state.transactions, newTransaction],
      budgets: updatedBudgets,
    };
  }),
  
  updateTransaction: (id, transactionData) => set((state) => {
    const oldTransaction = state.transactions.find((t) => t.id === id);
    if (!oldTransaction) return state;
    
    const newTransaction = { ...oldTransaction, ...transactionData };
    
    // Se l'importo o il tipo (entrata/uscita) è cambiato, dobbiamo aggiornare il budget
    const needsBudgetUpdate = 
      oldTransaction.amount !== newTransaction.amount || 
      oldTransaction.isExpense !== newTransaction.isExpense;
    
    let updatedBudgets = state.budgets;
    
    if (needsBudgetUpdate) {
      // Calcolo differenza vecchia transazione
      const oldAmountChange = oldTransaction.isExpense 
        ? -oldTransaction.amount 
        : oldTransaction.amount;
      
      // Calcolo differenza nuova transazione
      const newAmountChange = newTransaction.isExpense 
        ? -newTransaction.amount 
        : newTransaction.amount;
      
      // Totale dell'aggiustamento da applicare
      const totalAdjustment = -oldAmountChange + newAmountChange;
      
      updatedBudgets = state.budgets.map((budget) => {
        if (budget.id === oldTransaction.budgetId) {
          return {
            ...budget,
            currentAmount: budget.currentAmount + totalAdjustment,
          };
        }
        return budget;
      });
    }
    
    return {
      transactions: state.transactions.map((t) => 
        t.id === id ? newTransaction : t
      ),
      budgets: updatedBudgets,
    };
  }),
  
  deleteTransaction: (id) => set((state) => {
    const transactionToDelete = state.transactions.find((t) => t.id === id);
    if (!transactionToDelete) return state;
    
    // Aggiorniamo il currentAmount del budget associato
    const updatedBudgets = state.budgets.map((budget) => {
      if (budget.id === transactionToDelete.budgetId) {
        const amountChange = transactionToDelete.isExpense 
          ? transactionToDelete.amount 
          : -transactionToDelete.amount;
        
        return {
          ...budget,
          currentAmount: budget.currentAmount + amountChange,
        };
      }
      return budget;
    });
    
    return {
      transactions: state.transactions.filter((t) => t.id !== id),
      budgets: updatedBudgets,
    };
  }),
  
  // Gestione errori e caricamento
  setError: (message) => set({ hasError: true, errorMessage: message }),
  clearError: () => set({ hasError: false, errorMessage: '' }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Context per fornire lo stato globalmente
const BudJetStoreContext = createContext<null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <BudJetStoreContext.Provider value={null}>
      {children}
    </BudJetStoreContext.Provider>
  );
}