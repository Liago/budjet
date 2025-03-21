import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
  isWithinInterval,
  parseISO,
} from "date-fns";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string, startDate?: string, endDate?: string) {
    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Query base for transactions within date range
    const whereClause: any = {
      userId,
    };

    if (Object.keys(dateFilter).length > 0) {
      whereClause.date = dateFilter;
    }

    // Get all transactions within date range
    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            budget: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Get all categories with budget
    const categories = await this.prisma.category.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        color: true,
        budget: true,
      },
    });

    // Calculate total budget
    const totalBudget = categories.reduce(
      (sum, category) => sum + (category.budget ? Number(category.budget) : 0),
      0
    );

    // Calculate total income and expense
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpense;

    // Calculate budget remaining and percentage
    const budgetRemaining = totalBudget - totalExpense;
    const budgetPercentage =
      totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;

    // Calculate spending by category (for expenses only)
    const expenseTransactions = transactions.filter(
      (t) => t.type === "EXPENSE"
    );
    const categoryMap = new Map();

    // Initialize categoryMap with all categories that have a budget
    for (const category of categories) {
      if (category.budget) {
        categoryMap.set(category.id, {
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          amount: 0,
          budget: Number(category.budget),
          budgetPercentage: 0,
        });
      }
    }

    for (const transaction of expenseTransactions) {
      const categoryId = transaction.categoryId;
      const categoryName = transaction.category?.name || "Uncategorized";
      const categoryColor = transaction.category?.color || "#808080";
      const categoryBudget = transaction.category?.budget
        ? Number(transaction.category.budget)
        : 0;
      const amount = Number(transaction.amount);

      if (categoryMap.has(categoryId)) {
        categoryMap.get(categoryId).amount += amount;
      } else {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName,
          categoryColor,
          amount,
          budget: categoryBudget,
          budgetPercentage: 0,
        });
      }
    }

    // Group transactions by category and calculate total amounts
    const categoriesData = [];
    for (const [categoryId, data] of categoryMap.entries()) {
      // Calculate budget percentage for this category
      if (data.budget > 0) {
        data.budgetPercentage = Math.round((data.amount / data.budget) * 100);
      }

      categoriesData.push({
        categoryId,
        categoryName: data.categoryName,
        categoryColor: data.categoryColor,
        amount: data.amount,
        percentage: Math.round((data.amount / totalExpense) * 100) || 0,
        budget: data.budget || undefined,
        budgetPercentage: data.budgetPercentage || undefined,
      });
    }

    // Sort categories by amount in descending order
    categoriesData.sort((a, b) => b.amount - a.amount);

    // Get recent transactions
    const recentTransactions = transactions;

    return {
      totalIncome,
      totalExpense,
      balance,
      totalBudget,
      budgetRemaining,
      budgetPercentage,
      categories: categoriesData,
      recentTransactions,
      dateRange: {
        startDate,
        endDate,
      },
    };
  }

  async getTrendData(userId: string, timeRange: string = "3m") {
    // Determina il periodo (3m, 6m, 12m)
    let months = 3; // default
    if (timeRange === "6m") months = 6;
    if (timeRange === "12m") months = 12;

    const now = new Date();
    const trends = [];

    // Per ogni mese nel periodo richiesto
    for (let i = months - 1; i >= 0; i--) {
      const currentMonth = subMonths(now, i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      // Query per questo mese specifico
      const whereClause = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      // Ottieni le transazioni per questo mese
      const transactions = await this.prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      });

      // Calcola i totali per questo mese
      const incomeTotal = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expenseTotal = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const balance = incomeTotal - expenseTotal;

      // Aggiungi i dati di questo mese al risultato
      trends.push({
        period: format(currentMonth, "MMM yyyy"),
        income: incomeTotal,
        expense: expenseTotal,
        balance,
      });
    }

    return { trends };
  }

  // Nuovo metodo per generare previsioni finanziarie
  async getForecastData(userId: string, months: number = 6) {
    const now = new Date();
    const historicalData = [];
    let totalIncome = 0;
    let totalExpense = 0;
    let monthsWithData = 0;
    let lastBalance = 0;

    // Recupera dati storici degli ultimi 'months' mesi
    for (let i = months - 1; i >= 0; i--) {
      const currentMonth = subMonths(now, i);
      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(currentMonth);

      // Query per questo mese specifico
      const whereClause = {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      };

      // Ottieni le transazioni per questo mese
      const transactions = await this.prisma.transaction.findMany({
        where: whereClause,
      });

      // Calcola i totali per questo mese
      let monthlyIncome = 0;
      let monthlyExpense = 0;

      transactions.forEach((transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.type === "INCOME") {
          monthlyIncome += amount;
        } else if (transaction.type === "EXPENSE") {
          monthlyExpense += amount;
        }
      });

      // Calcola il saldo mensile
      const monthlyBalance = monthlyIncome - monthlyExpense;
      lastBalance = monthlyBalance; // Salva l'ultimo saldo per le previsioni

      // Aggiungi questo mese ai dati storici
      historicalData.push({
        period: format(currentMonth, "MMM yyyy"),
        value: monthlyBalance,
        forecast: false,
      });

      // Aggiorna i totali se ci sono transazioni
      if (transactions.length > 0) {
        totalIncome += monthlyIncome;
        totalExpense += monthlyExpense;
        monthsWithData++;
      }
    }

    // Calcola medie mensili
    const averageIncome = monthsWithData > 0 ? totalIncome / monthsWithData : 0;
    const averageExpense =
      monthsWithData > 0 ? totalExpense / monthsWithData : 0;

    // Genera dati di previsione per i prossimi 'months' mesi
    const forecastData = [];
    let runningBalance =
      historicalData.length > 0
        ? historicalData[historicalData.length - 1].value
        : 0;

    for (let i = 1; i <= months; i++) {
      const forecastMonth = addMonths(now, i);
      const monthlyNetChange = averageIncome - averageExpense;
      runningBalance += monthlyNetChange;

      forecastData.push({
        period: format(forecastMonth, "MMM yyyy"),
        value: runningBalance,
        forecast: true,
      });
    }

    return {
      historicalData,
      forecastData,
      averageIncome,
      averageExpense,
    };
  }

  // Nuovo metodo per generare suggerimenti di risparmio
  async getSavingSuggestions(userId: string) {
    const now = new Date();
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));
    const last3MonthsStart = startOfMonth(subMonths(now, 3));
    
    // Categorie di spese discrezionali che sono tipicamente adatte per la riduzione
    const discretionaryCategories = [
      'Intrattenimento', 'Ristorazione', 'Shopping', 
      'Abbonamenti', 'Viaggi', 'Svago', 'Hobby'
    ];
    
    // Categorie di spese fisse o essenziali
    const essentialCategories = [
      'Affitto', 'Mutuo', 'Bollette', 'Alimentari', 
      'Trasporti', 'Salute', 'Educazione'
    ];
    
    // 1. Ottieni le transazioni degli ultimi 3 mesi
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: last3MonthsStart,
          lte: now,
        },
        type: 'EXPENSE',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    
    // 2. Ottieni le transazioni dell'ultimo mese per confronto
    const lastMonthTransactions = recentTransactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= lastMonthStart && txDate <= lastMonthEnd;
    });
    
    // 3. Ottieni tutte le categorie dell'utente
    const userCategories = await this.prisma.category.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        color: true,
        budget: true,
      },
    });
    
    // 4. Calcola medie mensili di entrate e uscite
    const income3Months = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: last3MonthsStart,
          lte: now,
        },
        type: 'INCOME',
      },
      _sum: {
        amount: true,
      },
    });
    
    const expense3Months = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: {
          gte: last3MonthsStart,
          lte: now,
        },
        type: 'EXPENSE',
      },
      _sum: {
        amount: true,
      },
    });
    
    const totalIncome = income3Months.length > 0 ? Number(income3Months[0]._sum.amount) : 0;
    const totalExpense = expense3Months.length > 0 ? Number(expense3Months[0]._sum.amount) : 0;
    
    const monthsCount = 3;
    const averageMonthlyIncome = totalIncome / monthsCount;
    const averageMonthlyExpense = totalExpense / monthsCount;
    
    // 5. Raggruppa spese per categoria
    const spendingByCategory = new Map();
    
    recentTransactions.forEach(transaction => {
      const categoryId = transaction.categoryId;
      const categoryName = transaction.category?.name || 'Altro';
      const categoryColor = transaction.category?.color || '#808080';
      const amount = Number(transaction.amount);
      
      if (!spendingByCategory.has(categoryId)) {
        spendingByCategory.set(categoryId, {
          id: categoryId,
          name: categoryName,
          color: categoryColor,
          total: 0,
          transactions: [],
          isDiscretionary: discretionaryCategories.includes(categoryName),
          isEssential: essentialCategories.includes(categoryName),
        });
      }
      
      const categoryData = spendingByCategory.get(categoryId);
      categoryData.total += amount;
      categoryData.transactions.push(transaction);
    });
    
    // 6. Identifica categorie con spesa elevata rispetto al budget
    const categoriesWithHighSpending = [];
    
    spendingByCategory.forEach((categoryData, categoryId) => {
      const category = userCategories.find(c => c.id === categoryId);
      if (category && category.budget) {
        const monthlyBudget = Number(category.budget);
        const monthlyAverage = categoryData.total / monthsCount;
        
        if (monthlyAverage > monthlyBudget * 0.9) { // Spesa superiore al 90% del budget
          categoriesWithHighSpending.push({
            ...categoryData,
            budget: monthlyBudget,
            average: monthlyAverage,
            percentageOfBudget: (monthlyAverage / monthlyBudget) * 100,
          });
        }
      }
    });
    
    // 7. Identifica abbonamenti o spese ricorrenti
    const subscriptions = [];
    const subscriptionAmounts = new Map();
    
    // Cerca transazioni simili che potrebbero essere abbonamenti
    recentTransactions.forEach(transaction => {
      const amount = Number(transaction.amount).toFixed(2);
      const description = transaction.description.toLowerCase();
      
      // Ignora transazioni troppo piccole (sotto 1€)
      if (Number(amount) < 1) return;
      
      // Cerca parole chiave tipiche degli abbonamenti
      const subscriptionKeywords = ['netflix', 'spotify', 'abbonamento', 'mensile', 'subscription'];
      const isLikelySubscription = subscriptionKeywords.some(keyword => description.includes(keyword));
      
      if (isLikelySubscription) {
        if (!subscriptionAmounts.has(amount)) {
          subscriptionAmounts.set(amount, []);
        }
        subscriptionAmounts.get(amount).push(transaction);
      }
    });
    
    // Filtra per trovare importi che compaiono almeno 2 volte (probabilmente abbonamenti)
    subscriptionAmounts.forEach((transactions, amount) => {
      if (transactions.length >= 2) {
        const firstTx = transactions[0];
        subscriptions.push({
          id: `subscription-${firstTx.id}`,
          description: firstTx.description,
          amount: Number(amount),
          category: firstTx.category?.name || 'Abbonamenti',
          categoryId: firstTx.categoryId,
          categoryColor: firstTx.category?.color || '#808080',
          frequency: 'mensile', // Assunzione semplificata
        });
      }
    });
    
    // 8. Genera suggerimenti in base all'analisi
    const suggestions = [];
    let totalPotentialSavings = 0;
    
    // Suggerimenti per ridurre spese discrezionali eccessive
    discretionaryCategories.forEach(categoryName => {
      const matchingCategories = Array.from(spendingByCategory.values())
        .filter(cat => cat.name.toLowerCase().includes(categoryName.toLowerCase()));
      
      matchingCategories.forEach(category => {
        if (category.total > 0) {
          const monthlyAverage = category.total / monthsCount;
          
          // Suggerisci solo se la spesa mensile è significativa (sopra 50€)
          if (monthlyAverage >= 50) {
            const reductionRate = category.isDiscretionary ? 0.20 : 0.10; // 20% per discrezionali, 10% per le altre
            const potentialSaving = monthlyAverage * reductionRate;
            
            // Aggiungi suggerimento solo se il risparmio è significativo (almeno 10€)
            if (potentialSaving >= 10) {
              totalPotentialSavings += potentialSaving;
              
              suggestions.push({
                id: `reduce-${category.id}`,
                category: category.name,
                categoryColor: category.color,
                description: `Riduci le spese in ${category.name} del ${Math.round(reductionRate * 100)}%`,
                potentialSaving,
                type: 'spending_reduction',
                difficulty: monthlyAverage > 200 ? 'medium' : 'easy',
                impact: potentialSaving > 50 ? 'high' : potentialSaving > 20 ? 'medium' : 'low',
              });
            }
          }
        }
      });
    });
    
    // Suggerimento per ottimizzare abbonamenti
    if (subscriptions.length > 0) {
      const totalSubscriptions = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
      
      if (totalSubscriptions > 30) { // Suggerisci solo se spende più di 30€ al mese in abbonamenti
        const potentialSaving = totalSubscriptions * 0.3; // Assume 30% di risparmio potenziale
        totalPotentialSavings += potentialSaving;
        
        suggestions.push({
          id: 'optimize-subscriptions',
          category: 'Abbonamenti',
          categoryColor: '#FF6347', // Colore standard per abbonamenti
          description: `Rivedi i tuoi ${subscriptions.length} abbonamenti attivi`,
          potentialSaving,
          type: 'subscription',
          difficulty: 'medium',
          impact: potentialSaving > 50 ? 'high' : 'medium',
        });
      }
    }
    
    // Suggerimento per risparmio automatico se c'è un surplus
    if (averageMonthlyIncome > averageMonthlyExpense * 1.2) { // 20% di surplus
      const savingTarget = (averageMonthlyIncome - averageMonthlyExpense) * 0.5; // Suggerisci di risparmiare metà del surplus
      
      if (savingTarget > 50) { // Suggerisci solo se il risparmio è significativo
        suggestions.push({
          id: 'automated-saving',
          category: 'Risparmio',
          categoryColor: '#4CAF50', // Verde per risparmio
          description: 'Imposta un risparmio automatico mensile',
          potentialSaving: savingTarget,
          type: 'automation',
          difficulty: 'easy',
          impact: 'high',
        });
      }
    }
    
    // Suggerimento per budget se non ce ne sono
    const categoriesWithBudget = userCategories.filter(cat => cat.budget && Number(cat.budget) > 0);
    if (categoriesWithBudget.length < 3 && averageMonthlyExpense > 500) {
      suggestions.push({
        id: 'create-budgets',
        category: 'Pianificazione',
        categoryColor: '#3F51B5', // Blu per pianificazione
        description: 'Crea budget per le tue categorie principali',
        potentialSaving: averageMonthlyExpense * 0.1, // Tipicamente si risparmia 10% implementando budget
        type: 'spending_reduction',
        difficulty: 'medium',
        impact: 'high',
      });
    }
    
    // Ordina i suggerimenti per potenziale di risparmio
    suggestions.sort((a, b) => b.potentialSaving - a.potentialSaving);
    
    // Calcola la proiezione annuale
    const yearlyProjection = totalPotentialSavings * 12;
    
    return {
      suggestions,
      averageIncome: averageMonthlyIncome,
      averageExpense: averageMonthlyExpense,
      potentialMonthlySavings: totalPotentialSavings,
      yearlyProjection,
    };
  }
}
