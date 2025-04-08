import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { useAppDispatch, useAppSelector } from "../../store";
import { fetchDashboardStats } from "../../store/slices/dashboardSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { Button } from "../../components/common/button";
import { RootStackParamList } from "../../navigation";

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Tipi sicuri per i nostri dati
interface Transaction {
  id: string;
  description?: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category?: {
    name?: string;
    color?: string;
    icon?: string;
  };
}

interface Budget {
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  percentage?: number;
  spent?: number;
  budget?: number;
}

export default function DashboardScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const { stats, isLoading, error } = useAppSelector(
    (state) => state.dashboard
  );
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      // Definisci l'intervallo di date per il mese corrente
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      await Promise.all([
        dispatch(fetchDashboardStats({ startDate, endDate })),
        dispatch(fetchCategories()),
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (isLoading && !refreshing && !stats) {
    return <LoadingScreen message="Caricamento dashboard..." />;
  }

  // Protezione extra nella formattazione valuta
  const formatCurrency = (amount: any): string => {
    // Converti esplicitamente a number se possibile
    const numAmount = Number(amount);

    // Verifica se è un numero valido
    if (amount === undefined || amount === null || isNaN(numAmount)) {
      return "€0,00";
    }

    try {
      return `€${numAmount.toFixed(2)}`.replace(".", ",");
    } catch (error) {
      console.error("Error formatting currency:", error, amount);
      return "€0,00";
    }
  };

  // Ensure stats is defined before rendering with default safe values
  const safeStats = {
    balance: stats?.balance || 0,
    totalIncome: stats?.totalIncome || 0,
    totalExpense: stats?.totalExpense || 0,
    recentTransactions: Array.isArray(stats?.recentTransactions)
      ? stats.recentTransactions.map((t) => ({
          id: t.id || `tmp-${Math.random()}`,
          description: t.description || "",
          amount: typeof t.amount === "number" ? t.amount : 0,
          type: t.type || "EXPENSE",
          category: {
            name: t.category?.name || "Categoria",
            color: t.category?.color || "#ccc",
            icon: t.category?.icon || "apps-outline",
          },
        }))
      : [],
    budgetStatus: Array.isArray(stats?.budgetStatus)
      ? stats.budgetStatus.map((b) => ({
          categoryId: b.categoryId || `tmp-${Math.random()}`,
          categoryName: b.categoryName || "Categoria",
          categoryColor: b.categoryColor || "#ccc",
          percentage: typeof b.percentage === "number" ? b.percentage : 0,
          spent: typeof b.spent === "number" ? b.spent : 0,
          budget: typeof b.budget === "number" ? b.budget : 0,
        }))
      : [],
  };

  // Assicuriamoci che ogni transazione abbia i campi necessari prima di renderizzarla
  const renderTransactions = () => {
    if (
      !safeStats.recentTransactions ||
      safeStats.recentTransactions.length === 0
    ) {
      return (
        <View
          style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}
        >
          <Text
            style={[
              styles.emptyStateText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Nessuna transazione recente
          </Text>
        </View>
      );
    }

    return safeStats.recentTransactions.map((transaction: Transaction) => (
      <View
        key={transaction.id}
        style={[
          styles.transactionItem,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: transaction.category?.color || "#ccc" },
          ]}
        >
          <Ionicons
            name={(transaction.category?.icon as any) || "apps-outline"}
            size={18}
            color="#fff"
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text
            style={[
              styles.transactionDescription,
              { color: theme.colors.text },
            ]}
          >
            {transaction.description || "Senza descrizione"}
          </Text>
          <Text
            style={[
              styles.transactionCategory,
              { color: theme.colors.textSecondary },
            ]}
          >
            {transaction.category?.name || "Categoria"}
          </Text>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            {
              color:
                transaction.type === "INCOME"
                  ? theme.colors.success
                  : theme.colors.error,
            },
          ]}
        >
          {transaction.type === "INCOME" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </Text>
      </View>
    ));
  };

  // Assicuriamoci che ogni budget abbia i campi necessari prima di renderizzarlo
  const renderBudgets = () => {
    if (!safeStats.budgetStatus || safeStats.budgetStatus.length === 0) {
      return (
        <View
          style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}
        >
          <Text
            style={[
              styles.emptyStateText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Nessun budget impostato
          </Text>
        </View>
      );
    }

    return safeStats.budgetStatus.map((budget: Budget) => {
      const percentage =
        typeof budget.percentage === "number" ? budget.percentage : 0;

      return (
        <View
          key={budget.categoryId}
          style={[styles.budgetItem, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.budgetHeader}>
            <View style={styles.categoryInfo}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: budget.categoryColor || "#ccc" },
                ]}
              />
              <Text
                style={[styles.budgetCategory, { color: theme.colors.text }]}
              >
                {budget.categoryName || "Categoria"}
              </Text>
            </View>
            <Text
              style={[
                styles.budgetPercentage,
                {
                  color:
                    percentage >= 100 ? theme.colors.error : theme.colors.text,
                },
              ]}
            >
              {percentage.toFixed(0)}%
            </Text>
          </View>

          <View
            style={[
              styles.progressBarContainer,
              { backgroundColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor:
                    percentage >= 100
                      ? theme.colors.error
                      : percentage >= 80
                      ? theme.colors.warning
                      : theme.colors.success,
                  width: `${Math.min(percentage, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={styles.budgetValues}>
            <Text
              style={[
                styles.budgetSpent,
                { color: theme.colors.textSecondary },
              ]}
            >
              Speso: {formatCurrency(budget.spent)}
            </Text>
            <Text
              style={[
                styles.budgetTotal,
                { color: theme.colors.textSecondary },
              ]}
            >
              Budget: {formatCurrency(budget.budget)}
            </Text>
          </View>
        </View>
      );
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Header con saluto */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          Benvenuto
        </Text>
        <Text
          style={[styles.subGreeting, { color: theme.colors.textSecondary }]}
        >
          Ecco il riepilogo del tuo mese
        </Text>
      </View>

      {/* Riepilogo bilancio */}
      <View
        style={[styles.balanceCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text
          style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}
        >
          Bilancio del mese
        </Text>
        <Text
          style={[
            styles.balanceAmount,
            {
              color:
                safeStats.balance >= 0
                  ? theme.colors.success
                  : theme.colors.error,
            },
          ]}
        >
          {formatCurrency(safeStats.balance)}
        </Text>

        <View style={styles.incomeExpenseRow}>
          <View style={styles.incomeContainer}>
            <View style={styles.labelRow}>
              <Ionicons
                name="arrow-down-outline"
                size={16}
                color={theme.colors.success}
              />
              <Text
                style={[
                  styles.incomeExpenseLabel,
                  { color: theme.colors.text },
                ]}
              >
                Entrate
              </Text>
            </View>
            <Text
              style={[styles.incomeAmount, { color: theme.colors.success }]}
            >
              {formatCurrency(safeStats.totalIncome)}
            </Text>
          </View>

          <View style={styles.expenseContainer}>
            <View style={styles.labelRow}>
              <Ionicons
                name="arrow-up-outline"
                size={16}
                color={theme.colors.error}
              />
              <Text
                style={[
                  styles.incomeExpenseLabel,
                  { color: theme.colors.text },
                ]}
              >
                Uscite
              </Text>
            </View>
            <Text style={[styles.expenseAmount, { color: theme.colors.error }]}>
              {formatCurrency(safeStats.totalExpense)}
            </Text>
          </View>
        </View>
      </View>

      {/* Pulsante aggiungi transazione */}
      <View style={styles.addTransactionButtonContainer}>
        <Button
          title="Aggiungi transazione"
          leftIcon="add-outline"
          onPress={() => navigation.navigate("AddTransaction", {})}
          fullWidth
        />
      </View>

      {/* Ultime transazioni */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Ultime transazioni
          </Text>
          <Text
            style={[styles.viewAll, { color: theme.colors.primary }]}
            onPress={() => {
              /* Navigare alla pagina transazioni */
            }}
          >
            Vedi tutte
          </Text>
        </View>

        {renderTransactions()}
      </View>

      {/* Stato budget */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Stato budget
          </Text>
        </View>

        {renderBudgets()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subGreeting: {
    fontSize: 16,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
  },
  incomeExpenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  incomeContainer: {
    flex: 1,
  },
  expenseContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  incomeExpenseLabel: {
    fontSize: 14,
    marginLeft: 4,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addTransactionButtonContainer: {
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewAll: {
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
  },
  budgetItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: "500",
  },
  budgetPercentage: {
    fontSize: 16,
    fontWeight: "500",
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
  },
  budgetValues: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  budgetSpent: {
    fontSize: 14,
  },
  budgetTotal: {
    fontSize: 14,
  },
});
