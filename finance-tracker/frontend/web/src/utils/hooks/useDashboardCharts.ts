import { useMemo } from 'react';
import { Transaction } from '../../types/Transaction';
import { Category } from '../../types/Category';
import { Budget } from '../../types/Budget';
import { format, parseISO, differenceInDays, eachDayOfInterval, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';

type ChartTimeInterval = 'daily' | 'weekly' | 'monthly';

interface CategoryExpense {
  id: number;
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
}

interface BalanceData {
  date: string;
  balance: number;
}

interface DailySpending {
  date: string;
  amount: number;
}

interface TopCategory {
  name: string;
  amount: number;
  color: string;
}

interface BudgetCategory {
  id: number;
  name: string;
  color: string;
  budget: number;
  spent: number;
  percentage: number;
}

interface DashboardChartsData {
  totalIncome: number;
  totalExpense: number;
  totalBudget: number;
  budgetRemaining: number;
  budgetPercentage: number;
  expensesByCategory: CategoryExpense[];
  monthlyData: MonthlyData[];
  balanceData: BalanceData[];
  dailySpending: DailySpending[];
  topCategories: TopCategory[];
  budgetCategories: BudgetCategory[];
}

export function useDashboardCharts(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  startDate: Date,
  endDate: Date
): DashboardChartsData {
  
  return useMemo(() => {
    // Protezione per gli array e deep clone per evitare mutazioni
    const safeTransactions = Array.isArray(transactions) ? transactions.map(tx => ({...tx})) : [];
    const safeCategories = Array.isArray(categories) ? categories.map(cat => ({...cat})) : [];
    const safeBudgets = Array.isArray(budgets) ? budgets.map(budget => ({...budget})) : [];
     
    // Prima filtra le transazioni per il periodo selezionato e poi normalizza i dati
    const transactionsInRange = safeTransactions.filter(tx => {
      try {
        // Converti la stringa della data in oggetto Date
        let txDate;
        try {
          // Se è una stringa ISO o in formato YYYY-MM-DD
          txDate = typeof tx.date === 'string' ? parseISO(tx.date) : new Date(tx.date);
        } catch (e) {
          // Se parseISO fallisce, prova con il costruttore standard
          txDate = new Date(tx.date);
        }

        // Se non abbiamo ottenuto una data valida, escludi questa transazione
        if (isNaN(txDate.getTime())) {
          console.warn(`Data non valida per la transazione: ${tx.id}, data: ${tx.date}`);
          return false;
        }

        // Imposta la data all'inizio del giorno per evitare problemi con l'ora
        const txStartOfDay = startOfDay(txDate);
        
        // Verifica se la data della transazione è nel range
        const isInRange = isWithinInterval(txStartOfDay, { 
          start: startOfDay(startDate), 
          end: endOfDay(endDate) 
        });   
        
        return isInRange;
      } catch (e) {
        console.error("Errore nel filtrare la transazione per data:", e, tx);
        return false;
      }
    });

    // Assicuriamoci che i dati critici siano numeri validi
    const cleanTransactions = transactionsInRange.map(tx => {
      const normalizedTx = {
        ...tx,
        amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount)) || 0,
        // Gestisci sia la struttura categoryId che category.id
        categoryId: tx.categoryId || (tx.category && tx.category.id) || null,
        // Normalizza il tipo in maiuscolo e assicurati che sia un valore valido
        type: (() => {
          // Estrai il tipo dalla transazione
          let rawType = tx.type;
          
          // Gestione del caso in cui il tipo sia nell'oggetto 'category'
          if (!rawType && tx.category && tx.category.type) {
            rawType = tx.category.type;
          }
          
          // Normalizza in stringa e maiuscolo
          const normalizedType = typeof rawType === 'string' 
            ? rawType.toUpperCase().trim() 
            : String(rawType).toUpperCase().trim();
          
          // Convalida che sia un tipo valido
          if (normalizedType === 'INCOME' || normalizedType === 'EXPENSE') {
            return normalizedType;
          }
          
          return 'EXPENSE'; // Tipo predefinito
        })()
      };
          
      return normalizedTx;
    });
    
    // Log dei problemi per il debug
    if (cleanTransactions.some(tx => isNaN(tx.amount))) {
      console.warn('Alcuni importi delle transazioni non sono validi:', 
        cleanTransactions.filter(tx => isNaN(tx.amount)));
    }

    // Filtra le transazioni per tipo e calcola i totali
    const incomeTransactions = cleanTransactions.filter(tx => {
      // Verifico che sia veramente di tipo INCOME in modo più robusto
      const isIncome = tx.type === 'INCOME';
      return isIncome;
    });
    
    const expenseTransactions = cleanTransactions.filter(tx => {
      // Verifico che sia veramente di tipo EXPENSE in modo più robusto
      const isExpense = tx.type === 'EXPENSE';
      return isExpense;
    });
    
    
    // Calcolo dei totali con protezione da NaN
    const income = incomeTransactions.reduce((sum, tx) => {
      const amount = isNaN(tx.amount) ? 0 : tx.amount;
      return sum + amount;
    }, 0);
    
    const expense = expenseTransactions.reduce((sum, tx) => {
      const amount = isNaN(tx.amount) ? 0 : tx.amount;
      return sum + amount;
    }, 0);
    

    const totalBudget = safeBudgets.reduce((sum, budget) => sum + (parseFloat(String(budget.amount)) || 0), 0);
    const budgetRemaining = totalBudget - expense;
    const budgetPercentage = totalBudget > 0 
      ? Math.min(100, Math.max(0, Math.round((expense / totalBudget) * 100)))
      : 0;

    // Expenses by Category Chart
    const expensesMap = new Map<string, number>();
    cleanTransactions
      .filter(tx => tx.type === 'EXPENSE' && tx.categoryId)
      .forEach(tx => {
        const currentAmount = expensesMap.get(String(tx.categoryId)) || 0;
        expensesMap.set(String(tx.categoryId), currentAmount + tx.amount);
      });
    
    const expensesByCategory: CategoryExpense[] = [];
    
    // Calculate total expenses that have a category
    const totalCategorizedExpenses = Array.from(expensesMap.values()).reduce((sum, amount) => sum + amount, 0);
    
    // Map the expenses to categories
    expensesMap.forEach((amount, categoryId) => {
      const category = safeCategories.find(c => String(c.id) === categoryId);
      if (category) {
        expensesByCategory.push({
          id: typeof category.id === 'number' ? category.id : parseInt(String(category.id)) || 0,
          name: category.name || 'Categoria Sconosciuta',
          value: Math.max(0, amount),
          color: category.color || '#cccccc',
          percentage: totalCategorizedExpenses > 0 
            ? Math.min(100, Math.max(0, Math.round((amount / totalCategorizedExpenses) * 100)))
            : 0
        });
      }
    });
    
    // Sort by value descending
    expensesByCategory.sort((a, b) => b.value - a.value);

    // Monthly Income vs Expense Chart
    // Generiamo dati per ogni mese nel range selezionato
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    const monthlyData: MonthlyData[] = [];
    
    while (currentDate <= lastDate) {
      const monthYear = format(currentDate, 'MMM yyyy', { locale: it });
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      
      const monthTransactions = cleanTransactions.filter(tx => {
        try {
          const txDate = new Date(tx.date);
          return txDate >= monthStart && txDate <= monthEnd;
        } catch (e) {
          return false;
        }
      });
      
      const monthIncome = monthTransactions
        .filter(tx => tx.type === 'INCOME')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const monthExpense = monthTransactions
        .filter(tx => tx.type === 'EXPENSE')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      monthlyData.push({
        name: monthYear,
        income: monthIncome,
        expense: monthExpense
      });
      
      // Passa al mese successivo
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // Se non ci sono dati, aggiungi almeno il mese corrente
    if (monthlyData.length === 0) {
      monthlyData.push({
        name: format(new Date(), 'MMM yyyy', { locale: it }),
        income: 0,
        expense: 0
      });
    }

    // Balance trend chart - protezione per date non valide
    let datesInRange: Date[] = [];
    try {
      const days = differenceInDays(endDate, startDate) + 1;
      datesInRange = days > 0 && days < 366 
        ? eachDayOfInterval({ start: startDate, end: endDate })
        : [new Date()];
    } catch (error) {
      console.error('Errore nel calcolo delle date per il grafico del bilancio:', error);
      datesInRange = [new Date()];
    }
    
    let cumulativeBalance = 0;
    const balanceData: BalanceData[] = datesInRange.map(date => {
      try {
        const dayTransactions = cleanTransactions.filter(tx => {
          try {
            const txDate = new Date(tx.date);
            return isSameDay(txDate, date);
          } catch (e) {
            return false;
          }
        });
        
        const dayIncome = dayTransactions
          .filter(tx => tx.type === 'INCOME')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const dayExpense = dayTransactions
          .filter(tx => tx.type === 'EXPENSE')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        cumulativeBalance += (dayIncome - dayExpense);
        
        return {
          date: format(date, 'd MMM', { locale: it }),
          balance: cumulativeBalance
        };
      } catch (e) {
        return {
          date: format(date, 'd MMM', { locale: it }),
          balance: cumulativeBalance
        };
      }
    });

    // Daily spending chart con protezione errori
    const dailySpending: DailySpending[] = datesInRange.map(date => {
      try {
        const dayTransactions = cleanTransactions.filter(tx => {
          try {
            const txDate = new Date(tx.date);
            return isSameDay(txDate, date) && tx.type === 'EXPENSE';
          } catch (e) {
            return false;
          }
        });
        
        const dayExpense = dayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        
        return {
          date: format(date, 'd MMM', { locale: it }),
          amount: dayExpense
        };
      } catch (e) {
        return {
          date: format(date, 'd MMM', { locale: it }),
          amount: 0
        };
      }
    });

    // Top spending categories - prendi le prime 5 o meno se non ce ne sono abbastanza
    const topCategories: TopCategory[] = expensesByCategory
      .slice(0, Math.min(5, expensesByCategory.length))
      .map(cat => ({
        name: cat.name,
        amount: cat.value,
        color: cat.color
      }));

    // Budget progress by category con protezione per dati mancanti
    const budgetCategories: BudgetCategory[] = safeBudgets.map(budget => {
      try {
        const category = safeCategories.find(c => String(c.id) === String(budget.categoryId));
        const spent = cleanTransactions
          .filter(tx => tx.type === 'EXPENSE' && String(tx.categoryId) === String(budget.categoryId))
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        const budgetAmount = parseFloat(String(budget.amount)) || 0;
        const percentage = budgetAmount > 0 
          ? Math.min(100, Math.max(0, Math.round((spent / budgetAmount) * 100)))
          : 0;
        
        return {
          id: typeof budget.categoryId === 'number' ? budget.categoryId : parseInt(String(budget.categoryId)) || 0,
          name: (category && category.name) || 'Categoria Sconosciuta',
          color: (category && category.color) || '#cccccc',
          budget: budgetAmount,
          spent: spent,
          percentage: percentage
        };
      } catch (e) {
        console.error('Errore nel calcolo del budget per categoria:', e);
        return {
          id: 0,
          name: 'Errore',
          color: '#cccccc',
          budget: 0,
          spent: 0,
          percentage: 0
        };
      }
    });
    
    // Sort by percentage descending
    budgetCategories.sort((a, b) => b.percentage - a.percentage);

    return {
      totalIncome: income,
      totalExpense: expense,
      totalBudget,
      budgetRemaining,
      budgetPercentage,
      expensesByCategory,
      monthlyData,
      balanceData,
      dailySpending,
      topCategories,
      budgetCategories
    };
  }, [transactions, categories, budgets, startDate, endDate]);
}

export default useDashboardCharts; 