import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { useAppDispatch, useAppSelector } from "../../store";
import { fetchDashboardStats } from "../../store/slices/dashboardSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import {
  fetchTransactions,
  deleteTransaction,
} from "../../store/slices/transactionSlice";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { Button } from "../../components/common/button";
import { RootStackParamList } from "../../navigation";
import {
  DateFilter,
  DateFilterPeriod,
  getDateRangeFromPeriod,
} from "../../components/DateFilter";
import { TransactionItem } from "../../components/transaction-item";
import { transactionService } from "../../api/services";

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const dashboardState = useAppSelector((state) => state.dashboard);
  const stats = dashboardState?.stats;
  const isLoading = dashboardState?.isLoading || false;

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] =
    useState<DateFilterPeriod>("current");
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  // Local state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<
    string[]
  >([]);
  const [enableMultiSelect, setEnableMultiSelect] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  // 🔧 FIX: Stato locale per transazioni recenti
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      // Determina l'intervallo di date
      let startDate, endDate;

      if (selectedPeriod === "custom" && customDateRange) {
        startDate = customDateRange.startDate;
        endDate = customDateRange.endDate;
      } else {
        const dateRange = getDateRangeFromPeriod(selectedPeriod);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      }

      // Carica i dati necessari
      await dispatch(fetchDashboardStats({ startDate, endDate }));
      await dispatch(fetchCategories());

      // 🔧 FIX: Aggiungi chiamata separata per transazioni recenti come fa il web
      console.log("🔍 [DEBUG] Fetching recent transactions separately...");
      try {
        const recentTransactionsResponse = await transactionService.getAll({
          limit: 5,
          // Recupera transazioni recenti senza filtri di data per mostrare le ultime 5
        });

        console.log("✅ [DEBUG] Recent transactions response:", {
          count: recentTransactionsResponse?.data?.length || 0,
          data: recentTransactionsResponse?.data?.slice(0, 2), // Log solo prime 2 per debug
        });

        // 🔧 FIX: Salva le transazioni recenti nello stato locale
        if (recentTransactionsResponse?.data) {
          setRecentTransactions(recentTransactionsResponse.data.slice(0, 5));
        }
      } catch (recentError) {
        console.error(
          "❌ [DEBUG] Error fetching recent transactions:",
          recentError
        );
      }
    } catch (error) {
      console.error("Errore durante il caricamento dei dati:", error);
    }
  }, [dispatch, selectedPeriod, customDateRange]);

  // Carica i dati iniziali
  useEffect(() => {
    loadData();
  }, [selectedPeriod, customDateRange]); // Rimuovo loadData dalle dipendenze per evitare loop

  // Gestisce l'aggiornamento tramite pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Gestisce il cambio di periodo
  const handlePeriodChange = useCallback((period: DateFilterPeriod) => {
    setSelectedPeriod(period);

    // Se non è un periodo personalizzato, resettiamo il range di date personalizzato
    if (period !== "custom") {
      setCustomDateRange(null);
    }
  }, []);

  // Gestisce la selezione di un intervallo di date personalizzato
  const handleCustomDateRangeSelect = useCallback(
    (startDate: string, endDate: string) => {
      setCustomDateRange({ startDate, endDate });
    },
    []
  );

  // Gestisce l'eliminazione di una transazione
  const handleDeleteTransaction = useCallback(
    async (transactionId: string) => {
      try {
        await dispatch(deleteTransaction(transactionId));
        Alert.alert("Successo", "Transazione eliminata con successo");
        loadData();
      } catch (error) {
        console.error("Errore durante l'eliminazione:", error);
        Alert.alert("Errore", "Impossibile eliminare la transazione");
      }
    },
    [dispatch, loadData]
  );

  // Formatta la valuta
  const formatCurrency = useCallback((amount: any): string => {
    const numAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numAmount)) {
      return "€0,00";
    }

    try {
      return `€${numAmount.toFixed(2)}`.replace(".", ",");
    } catch (error) {
      console.error(
        "Errore durante la formattazione della valuta:",
        error,
        amount
      );
      return "€0,00";
    }
  }, []);

  if (isLoading && !refreshing && !stats) {
    return <LoadingScreen message="Caricamento dashboard..." />;
  }

  // Valori sicuri per le statistiche
  const safeStats = {
    balance: stats?.balance || 0,
    totalIncome: stats?.totalIncome || 0,
    totalExpense: stats?.totalExpense || 0,
    totalBudget: stats?.totalBudget || 0,
    budgetRemaining: stats?.budgetRemaining || 0,
    budgetPercentage: stats?.budgetPercentage || 0,
    // 🔧 REMOVED: recentTransactions ora gestite con stato locale
    budgetStatus: Array.isArray(stats?.budgetStatus) ? stats.budgetStatus : [],
  };

  // Renderizza le transazioni
  const renderTransactions = () => {
    // 🔧 FIX: Usa stato locale per transazioni recenti invece di safeStats
    if (!recentTransactions || recentTransactions.length === 0) {
      return (
        <View style={styles.emptyState}>
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

    return (
      <View>
        {recentTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onDelete={handleDeleteTransaction}
          />
        ))}
      </View>
    );
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

      {/* Filtri per data */}
      <View style={styles.dateFilterContainer}>
        <DateFilter
          selectedPeriod={selectedPeriod}
          onSelectPeriod={handlePeriodChange}
          onSelectCustomRange={handleCustomDateRangeSelect}
        />
      </View>

      {/* Riepilogo bilancio */}
      <View
        style={[styles.balanceCard, { backgroundColor: theme.colors.surface }]}
      >
        <Text
          style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}
        >
          Bilancio del periodo
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
              // Naviga direttamente alla schermata Transactions
              navigation.navigate("Transactions");
            }}
          >
            Vedi tutte
          </Text>
        </View>

        {renderTransactions()}
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
  dateFilterContainer: {
    marginBottom: 16,
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
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 14,
  },
});
