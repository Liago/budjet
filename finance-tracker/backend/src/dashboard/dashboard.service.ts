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
  subDays,
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
    try {
      // Determina il periodo in base al parametro
      const months = this.getMonthsFromTimeRange(timeRange);
      const now = new Date();
      const startDate = startOfMonth(subMonths(now, months));

      // Periodo precedente per confronto
      const previousStartDate = startOfMonth(subMonths(startDate, months));
      const previousEndDate = subDays(startDate, 1);

      // 1. Ottieni le transazioni per il periodo corrente
      const currentTransactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: now,
          },
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
        orderBy: {
          date: "asc",
        },
      });

      // 2. Ottieni le transazioni per il periodo precedente
      const previousTransactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
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
        orderBy: {
          date: "asc",
        },
      });

      // 3. Genera dati per ogni mese nel periodo
      const trends = this.generateMonthlyTrends(currentTransactions, months);

      // 4. Calcola le tendenze per categoria
      const categoryTrends = this.calculateCategoryTrends(
        currentTransactions,
        previousTransactions
      );

      // 5. Calcola anomalie di spesa
      const spendingAnomalies = this.detectSpendingAnomalies(
        currentTransactions,
        months
      );

      return {
        trends,
        categoryTrends,
        spendingAnomalies,
      };
    } catch (error) {
      console.error("Errore nel recupero dei dati di trend:", error);
      throw new Error("Errore nel calcolo dei dati di trend");
    }
  }

  // Helper per determinare il numero di mesi dal timeRange
  private getMonthsFromTimeRange(timeRange: string): number {
    switch (timeRange) {
      case "1m":
        return 1;
      case "3m":
        return 3;
      case "6m":
        return 6;
      case "12m":
        return 12;
      default:
        return 3; // Default a 3 mesi
    }
  }

  // Genera trends mensili di income/expense/balance
  private generateMonthlyTrends(transactions: any[], months: number): any[] {
    const now = new Date();
    const trends = [];

    // Crea una entry per ogni mese, andando indietro a partire dall'attuale
    for (let i = months - 1; i >= 0; i--) {
      const currentMonth = subMonths(now, i);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const monthKey = format(currentMonth, "MMM yyyy");

      // Filtra le transazioni per il mese corrente
      const monthlyTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return isWithinInterval(txDate, { start: monthStart, end: monthEnd });
      });

      // Calcola income, expense e balance
      const income = monthlyTransactions
        .filter((tx) => tx.type === "INCOME")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      const expense = monthlyTransactions
        .filter((tx) => tx.type === "EXPENSE")
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      trends.push({
        period: monthKey,
        income,
        expense,
        balance: income - expense,
      });
    }

    return trends;
  }

  // Calcola le tendenze per categoria
  private calculateCategoryTrends(
    currentTxs: any[],
    previousTxs: any[]
  ): any[] {
    // Mappa per tenere traccia delle spese per categoria nel periodo corrente
    const currentCategoryMap = new Map();
    // Mappa per tenere traccia delle spese per categoria nel periodo precedente
    const previousCategoryMap = new Map();

    // Calcola le spese attuali per categoria
    currentTxs
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        const categoryId = tx.category.id;
        const amount = Number(tx.amount);

        if (!currentCategoryMap.has(categoryId)) {
          currentCategoryMap.set(categoryId, {
            id: categoryId,
            name: tx.category.name,
            color: tx.category.color,
            amount: 0,
            transactions: [],
          });
        }

        const categoryData = currentCategoryMap.get(categoryId);
        categoryData.amount += amount;
        categoryData.transactions.push(tx);
        currentCategoryMap.set(categoryId, categoryData);
      });

    // Calcola le spese precedenti per categoria
    previousTxs
      .filter((tx) => tx.type === "EXPENSE")
      .forEach((tx) => {
        const categoryId = tx.category.id;
        const amount = Number(tx.amount);

        if (!previousCategoryMap.has(categoryId)) {
          previousCategoryMap.set(categoryId, {
            id: categoryId,
            name: tx.category.name,
            color: tx.category.color,
            amount: 0,
          });
        }

        const categoryData = previousCategoryMap.get(categoryId);
        categoryData.amount += amount;
        previousCategoryMap.set(categoryId, categoryData);
      });

    // Calcola le tendenze confrontando i due periodi
    const trends = [];

    currentCategoryMap.forEach((currentData, categoryId) => {
      const previousData = previousCategoryMap.get(categoryId) || { amount: 0 };
      const amountChange = currentData.amount - previousData.amount;

      // Calcola la variazione percentuale
      let percentChange = 0;
      if (previousData.amount > 0) {
        percentChange = (amountChange / previousData.amount) * 100;
      } else if (currentData.amount > 0) {
        percentChange = 100; // Se non c'erano spese prima, l'aumento è del 100%
      }

      trends.push({
        id: categoryId,
        name: currentData.name,
        color: currentData.color,
        currentAmount: currentData.amount,
        previousAmount: previousData.amount,
        change: amountChange,
        percentChange: percentChange,
        transactionCount: currentData.transactions.length,
      });
    });

    // Aggiungi categorie che esistevano nel periodo precedente ma non in quello attuale
    previousCategoryMap.forEach((previousData, categoryId) => {
      if (!currentCategoryMap.has(categoryId)) {
        trends.push({
          id: categoryId,
          name: previousData.name,
          color: previousData.color,
          currentAmount: 0,
          previousAmount: previousData.amount,
          change: -previousData.amount,
          percentChange: -100, // Diminuzione del 100%
          transactionCount: 0,
        });
      }
    });

    // Ordina per variazione percentuale (decrescente in valore assoluto)
    return trends.sort(
      (a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange)
    );
  }

  // Rileva anomalie di spesa
  private detectSpendingAnomalies(transactions: any[], months: number): any[] {
    const now = new Date();
    const anomalies = [];

    // Mappa per tenere traccia delle spese mensili per categoria
    const categoryMonthlyMap = new Map<string, Map<string, number>>();

    // Per ogni mese negli ultimi 'months'
    for (let i = 0; i < months; i++) {
      const currentMonth = subMonths(now, i);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const monthKey = format(currentMonth, "MMM yyyy");

      // Filtra le transazioni per questo mese
      const monthlyTransactions = transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          tx.type === "EXPENSE" &&
          isWithinInterval(txDate, { start: monthStart, end: monthEnd })
        );
      });

      // Calcola le spese per categoria in questo mese
      monthlyTransactions.forEach((tx) => {
        const categoryId = tx.category.id;
        const amount = Number(tx.amount);

        if (!categoryMonthlyMap.has(categoryId)) {
          categoryMonthlyMap.set(categoryId, new Map<string, number>());
        }

        const monthlyData = categoryMonthlyMap.get(categoryId)!;
        const currentAmount = monthlyData.get(monthKey) || 0;
        monthlyData.set(monthKey, currentAmount + amount);
      });
    }

    // Calcola le anomalie confrontando con la media
    categoryMonthlyMap.forEach((monthlyData, categoryId) => {
      // Ottieni tutti i valori mensili per questa categoria
      const values = Array.from(monthlyData.values());

      // Calcola la media
      const sum = values.reduce((acc: number, val: number) => acc + val, 0);
      const average = values.length > 0 ? sum / values.length : 0;

      // Se la media è troppo bassa, ignora (evita anomalie su piccole spese)
      if (average < 10) return;

      // Cerca mesi con variazione significativa rispetto alla media
      monthlyData.forEach((amount, month) => {
        const deviation = amount - average;
        const percentDeviation = (deviation / average) * 100;

        // Considera significativa una variazione del 50% o più
        if (Math.abs(percentDeviation) >= 50) {
          // Trova i dettagli della categoria
          const categoryTx = transactions.find(
            (tx) => tx.category.id === categoryId
          );
          if (!categoryTx) return;

          anomalies.push({
            category: categoryTx.category.name,
            color: categoryTx.category.color,
            month,
            amount,
            averageAmount: average,
            deviation,
            percentDeviation,
          });
        }
      });
    });

    // Ordina per deviazione percentuale (decrescente in valore assoluto)
    return anomalies.sort(
      (a, b) => Math.abs(b.percentDeviation) - Math.abs(a.percentDeviation)
    );
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
      "Intrattenimento",
      "Ristorazione",
      "Shopping",
      "Abbonamenti",
      "Viaggi",
      "Svago",
      "Hobby",
    ];

    // Categorie di spese fisse o essenziali
    const essentialCategories = [
      "Affitto",
      "Mutuo",
      "Bollette",
      "Alimentari",
      "Trasporti",
      "Salute",
      "Educazione",
    ];

    // 1. Ottieni le transazioni degli ultimi 3 mesi
    const recentTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: last3MonthsStart,
          lte: now,
        },
        type: "EXPENSE",
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
      orderBy: { date: "desc" },
    });

    // 2. Ottieni le transazioni dell'ultimo mese per confronto
    const lastMonthTransactions = recentTransactions.filter((tx) => {
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
      by: ["type"],
      where: {
        userId,
        date: {
          gte: last3MonthsStart,
          lte: now,
        },
        type: "INCOME",
      },
      _sum: {
        amount: true,
      },
    });

    const expense3Months = await this.prisma.transaction.groupBy({
      by: ["type"],
      where: {
        userId,
        date: {
          gte: last3MonthsStart,
          lte: now,
        },
        type: "EXPENSE",
      },
      _sum: {
        amount: true,
      },
    });

    const totalIncome =
      income3Months.length > 0 ? Number(income3Months[0]._sum.amount) : 0;
    const totalExpense =
      expense3Months.length > 0 ? Number(expense3Months[0]._sum.amount) : 0;

    const monthsCount = 3;
    const averageMonthlyIncome = totalIncome / monthsCount;
    const averageMonthlyExpense = totalExpense / monthsCount;

    // 5. Raggruppa spese per categoria
    const spendingByCategory = new Map();

    recentTransactions.forEach((transaction) => {
      const categoryId = transaction.categoryId;
      const categoryName = transaction.category?.name || "Altro";
      const categoryColor = transaction.category?.color || "#808080";
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
      const category = userCategories.find((c) => c.id === categoryId);
      if (category && category.budget) {
        const monthlyBudget = Number(category.budget);
        const monthlyAverage = categoryData.total / monthsCount;

        if (monthlyAverage > monthlyBudget * 0.9) {
          // Spesa superiore al 90% del budget
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
    recentTransactions.forEach((transaction) => {
      const amount = Number(transaction.amount).toFixed(2);
      const description = transaction.description.toLowerCase();

      // Ignora transazioni troppo piccole (sotto 1€)
      if (Number(amount) < 1) return;

      // Cerca parole chiave tipiche degli abbonamenti
      const subscriptionKeywords = [
        "netflix",
        "spotify",
        "abbonamento",
        "mensile",
        "subscription",
      ];
      const isLikelySubscription = subscriptionKeywords.some((keyword) =>
        description.includes(keyword)
      );

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
          category: firstTx.category?.name || "Abbonamenti",
          categoryId: firstTx.categoryId,
          categoryColor: firstTx.category?.color || "#808080",
          frequency: "mensile", // Assunzione semplificata
        });
      }
    });

    // 8. Genera suggerimenti in base all'analisi
    const suggestions = [];
    let totalPotentialSavings = 0;

    // Suggerimenti per ridurre spese discrezionali eccessive
    discretionaryCategories.forEach((categoryName) => {
      const matchingCategories = Array.from(spendingByCategory.values()).filter(
        (cat) => cat.name.toLowerCase().includes(categoryName.toLowerCase())
      );

      matchingCategories.forEach((category) => {
        if (category.total > 0) {
          const monthlyAverage = category.total / monthsCount;

          // Suggerisci solo se la spesa mensile è significativa (sopra 50€)
          if (monthlyAverage >= 50) {
            const reductionRate = category.isDiscretionary ? 0.2 : 0.1; // 20% per discrezionali, 10% per le altre
            const potentialSaving = monthlyAverage * reductionRate;

            // Aggiungi suggerimento solo se il risparmio è significativo (almeno 10€)
            if (potentialSaving >= 10) {
              totalPotentialSavings += potentialSaving;

              suggestions.push({
                id: `reduce-${category.id}`,
                category: category.name,
                categoryColor: category.color,
                description: `Riduci le spese in ${
                  category.name
                } del ${Math.round(reductionRate * 100)}%`,
                potentialSaving,
                type: "spending_reduction",
                difficulty: monthlyAverage > 200 ? "medium" : "easy",
                impact:
                  potentialSaving > 50
                    ? "high"
                    : potentialSaving > 20
                    ? "medium"
                    : "low",
              });
            }
          }
        }
      });
    });

    // Suggerimento per ottimizzare abbonamenti
    if (subscriptions.length > 0) {
      const totalSubscriptions = subscriptions.reduce(
        (sum, sub) => sum + sub.amount,
        0
      );

      if (totalSubscriptions > 30) {
        // Suggerisci solo se spende più di 30€ al mese in abbonamenti
        const potentialSaving = totalSubscriptions * 0.3; // Assume 30% di risparmio potenziale
        totalPotentialSavings += potentialSaving;

        suggestions.push({
          id: "optimize-subscriptions",
          category: "Abbonamenti",
          categoryColor: "#FF6347", // Colore standard per abbonamenti
          description: `Rivedi i tuoi ${subscriptions.length} abbonamenti attivi`,
          potentialSaving,
          type: "subscription",
          difficulty: "medium",
          impact: potentialSaving > 50 ? "high" : "medium",
        });
      }
    }

    // Suggerimento per risparmio automatico se c'è un surplus
    if (averageMonthlyIncome > averageMonthlyExpense * 1.2) {
      // 20% di surplus
      const savingTarget = (averageMonthlyIncome - averageMonthlyExpense) * 0.5; // Suggerisci di risparmiare metà del surplus

      if (savingTarget > 50) {
        // Suggerisci solo se il risparmio è significativo
        suggestions.push({
          id: "automated-saving",
          category: "Risparmio",
          categoryColor: "#4CAF50", // Verde per risparmio
          description: "Imposta un risparmio automatico mensile",
          potentialSaving: savingTarget,
          type: "automation",
          difficulty: "easy",
          impact: "high",
        });
      }
    }

    // Suggerimento per budget se non ce ne sono
    const categoriesWithBudget = userCategories.filter(
      (cat) => cat.budget && Number(cat.budget) > 0
    );
    if (categoriesWithBudget.length < 3 && averageMonthlyExpense > 500) {
      suggestions.push({
        id: "create-budgets",
        category: "Pianificazione",
        categoryColor: "#3F51B5", // Blu per pianificazione
        description: "Crea budget per le tue categorie principali",
        potentialSaving: averageMonthlyExpense * 0.1, // Tipicamente si risparmia 10% implementando budget
        type: "spending_reduction",
        difficulty: "medium",
        impact: "high",
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

  async getBudgetAnalysis(userId: string, timeRange: string = "1m") {
    try {
      // Determine the period based on the parameter
      const months = this.getMonthsFromTimeRange(timeRange);
      const now = new Date();
      const startDate = startOfMonth(subMonths(now, months));
      const endDate = endOfMonth(now);

      // Get all categories with budget
      const categories = await this.prisma.category.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          budget: true,
        },
      });

      const categoriesWithBudget = categories.filter(
        (cat) => cat.budget && Number(cat.budget) > 0
      );

      // Calculate total budget from categories
      const totalBudget = categoriesWithBudget.reduce(
        (sum, category) => sum + Number(category.budget),
        0
      );

      // Get all expense transactions within the date range
      const transactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
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
      });

      // Get historical transactions for trend analysis (previous period)
      const previousStartDate = startOfMonth(subMonths(startDate, months));
      const previousEndDate = subDays(startDate, 1);

      const previousTransactions = await this.prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: previousStartDate,
            lte: previousEndDate,
          },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Group current transactions by category
      const categorySpending = new Map();

      // Initialize with all categories that have a budget
      for (const category of categoriesWithBudget) {
        categorySpending.set(category.id, {
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          categoryIcon: category.icon,
          budget: Number(category.budget),
          amount: 0,
          deviation: 0,
          deviationPercentage: 0,
          isOverBudget: false,
          previousAmount: 0,
        });
      }

      // Calculate current spending by category
      for (const transaction of transactions) {
        const categoryId = transaction.categoryId;
        if (!categoryId) continue; // Skip uncategorized transactions

        const amount = Number(transaction.amount);

        if (categorySpending.has(categoryId)) {
          categorySpending.get(categoryId).amount += amount;
        } else if (
          transaction.category?.budget &&
          Number(transaction.category.budget) > 0
        ) {
          // If not initialized but has budget
          categorySpending.set(categoryId, {
            categoryId,
            categoryName: transaction.category.name,
            categoryColor: transaction.category.color,
            budget: Number(transaction.category.budget),
            amount,
            deviation: 0,
            deviationPercentage: 0,
            isOverBudget: false,
            previousAmount: 0,
          });
        }
      }

      // Calculate previous period spending by category
      const previousCategorySpending = new Map();

      for (const transaction of previousTransactions) {
        const categoryId = transaction.categoryId;
        if (!categoryId) continue;

        const amount = Number(transaction.amount);

        if (previousCategorySpending.has(categoryId)) {
          previousCategorySpending.get(categoryId).amount += amount;
        } else {
          previousCategorySpending.set(categoryId, {
            categoryId,
            amount,
            categoryName: transaction.category?.name || "Uncategorized",
          });
        }
      }

      // Calculate deviations and regular exceeding patterns
      const categoryAnalysis = [];
      let totalSpent = 0;

      for (const [categoryId, data] of categorySpending.entries()) {
        // Get the amount from the current period
        const currentAmount = data.amount;
        totalSpent += currentAmount;

        // Calculate deviation from budget
        const deviation = data.budget - currentAmount;
        const deviationPercentage =
          data.budget > 0
            ? Math.round((Math.abs(deviation) / data.budget) * 100)
            : 0;

        // Check if spending exceeds budget
        const isOverBudget = currentAmount > data.budget;

        // Check if this is a regular pattern
        let isRegularlyExceeding = false;
        let suggestion = "";

        // Get previous period data for this category
        const previousData = previousCategorySpending.get(categoryId);
        const previousAmount = previousData ? previousData.amount : 0;

        // If consistently exceeding budget
        if (isOverBudget && previousAmount > data.budget) {
          isRegularlyExceeding = true;

          // Calculate average overspending
          const avgOverspending =
            (currentAmount - data.budget + (previousAmount - data.budget)) / 2;
          const recommendedBudget = Math.ceil(data.budget + avgOverspending);

          suggestion = `Considera di aumentare il budget a ${recommendedBudget}€ o ridurre le spese di almeno ${Math.ceil(
            currentAmount - data.budget
          )}€ mensili`;
        }

        categoryAnalysis.push({
          ...data,
          deviation,
          deviationPercentage,
          isOverBudget,
          isRegularlyExceeding,
          suggestion,
          previousAmount,
          budgetPercentage: Math.round((currentAmount / data.budget) * 100),
        });
      }

      // Calculate total metrics
      const totalRemaining = totalBudget - totalSpent;
      const totalDeviation = totalBudget - totalSpent;
      const totalDeviationPercentage =
        totalBudget > 0
          ? Math.round((Math.abs(totalDeviation) / totalBudget) * 100)
          : 0;

      // Generate suggestions
      const suggestions = [];

      // Find categories consistently over budget
      const consistentlyOverBudget = categoryAnalysis.filter(
        (cat) => cat.isOverBudget && cat.isRegularlyExceeding
      );

      if (consistentlyOverBudget.length > 0) {
        suggestions.push({
          title: "Rivedi il budget delle categorie problematiche",
          description: `Ci sono ${consistentlyOverBudget.length} categorie che superano regolarmente il budget. Considera di aumentare il budget allocato o ridurre le spese in queste aree.`,
          potentialSaving: consistentlyOverBudget.reduce(
            (sum, cat) => sum + (cat.amount - cat.budget),
            0
          ),
        });
      }

      // Suggest redistribution of budget if there are significant underspending categories
      const significantlyUnderBudget = categoryAnalysis.filter(
        (cat) => !cat.isOverBudget && cat.deviation > cat.budget * 0.3
      );

      if (
        significantlyUnderBudget.length > 0 &&
        consistentlyOverBudget.length > 0
      ) {
        const potentialRedistribution = Math.min(
          significantlyUnderBudget.reduce((sum, cat) => sum + cat.deviation, 0),
          consistentlyOverBudget.reduce(
            (sum, cat) => sum + Math.abs(cat.deviation),
            0
          )
        );

        if (potentialRedistribution > 0) {
          suggestions.push({
            title: "Redistribuisci il budget inutilizzato",
            description:
              "Alcune categorie sono significativamente sotto budget mentre altre lo superano. Considera di redistribuire il budget non utilizzato per coprire le aree in cui spendi di più.",
            potentialSaving: potentialRedistribution,
          });
        }
      }

      return {
        totalBudget,
        totalSpent,
        totalRemaining,
        totalDeviation,
        totalDeviationPercentage,
        categoryAnalysis,
        suggestions,
        dateRange: {
          startDate,
          endDate,
        },
      };
    } catch (error) {
      console.error("Error in getBudgetAnalysis:", error);
      throw new Error("Failed to analyze budget data");
    }
  }
}
