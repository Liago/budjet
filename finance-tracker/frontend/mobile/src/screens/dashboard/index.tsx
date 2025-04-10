import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useAppDispatch, useAppSelector } from '../../store';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchTransactions, deleteTransaction } from '../../store/slices/transactionSlice';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { Button } from '../../components/common/button';
import { RootStackParamList } from '../../navigation';
import { DateFilter, DateFilterPeriod, getDateRangeFromPeriod } from '../../components/DateFilter';
import { TransactionItem } from '../../components/transaction-item';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<DashboardScreenNavigationProp>();

  const { stats, isLoading, error } = useAppSelector(
    (state) => state.dashboard
  );
  
  // Accediamo a transactionState invece di destructuring immediatamente
  const transactionState = useAppSelector((state) => state.transactions);
  // Ora possiamo accedere a transactions in modo sicuro
  const transactions = transactionState?.transactions || [];
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<DateFilterPeriod>('current');
  const [customDateRange, setCustomDateRange] = useState<{startDate: string, endDate: string} | null>(null);

  // Carica i dati in base al periodo selezionato
  const loadData = async () => {
    try {
      // Determina l'intervallo di date
      let startDate, endDate;
      
      if (selectedPeriod === 'custom' && customDateRange) {
        // Se è stato selezionato un intervallo personalizzato, usa quelle date
        startDate = customDateRange.startDate;
        endDate = customDateRange.endDate;
      } else {
        // Altrimenti usa le date calcolate in base al periodo selezionato
        const dateRange = getDateRangeFromPeriod(selectedPeriod);
        startDate = dateRange.startDate;
        endDate = dateRange.endDate;
      }
      
      console.log(`Caricamento dati per periodo ${selectedPeriod}:`, { startDate, endDate });

      // Prima carica le statistiche della dashboard
      const result = await dispatch(fetchDashboardStats({ startDate, endDate })).unwrap();
      console.log('Statistiche dashboard caricate:', result);

      // Poi carica le transazioni con lo stesso intervallo di date
      try {
        const transactionsResult = await dispatch(
          fetchTransactions({
            startDate,
            endDate,
            limit: 100,
          })
        ).unwrap();
        console.log('Transazioni caricate:', transactionsResult?.meta?.total || 'N/A');
      } catch (transactionError) {
        console.error('Errore durante il caricamento delle transazioni:', transactionError);
      }

      // Infine carica le categorie
      await dispatch(fetchCategories());
      console.log('Categorie caricate');
    } catch (error) {
      console.error('Errore durante il caricamento dei dati della dashboard:', error);
    }
  };

  // Gestisce il cambio di periodo
  const handlePeriodChange = (period: DateFilterPeriod) => {
    console.log(`Cambio periodo a: ${period}`);
    setSelectedPeriod(period);
    
    // Se non è un periodo personalizzato, resettiamo il range di date personalizzato
    if (period !== 'custom') {
      setCustomDateRange(null);
    }
    
    // Ricarica i dati quando cambia il periodo
    // Nota: per il periodo custom, i dati saranno caricati dopo che l'utente 
    // avrà selezionato l'intervallo di date
    if (period !== 'custom') {
      loadData();
    }
  };

  // Gestisce la selezione di un intervallo di date personalizzato
  const handleCustomDateRangeSelect = (startDate: string, endDate: string) => {
    console.log('Range date personalizzato selezionato:', { startDate, endDate });
    setCustomDateRange({ startDate, endDate });
    // Ricarica i dati con il nuovo intervallo di date personalizzato
    setTimeout(() => loadData(), 0);
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Gestisce l'eliminazione di una transazione
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await dispatch(deleteTransaction(transactionId)).unwrap();
      Alert.alert('Successo', 'Transazione eliminata con successo');
      // Ricarica i dati
      onRefresh();
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      Alert.alert('Errore', 'Impossibile eliminare la transazione');
    }
  };

  if (isLoading && !refreshing && !stats) {
    return <LoadingScreen message="Caricamento dashboard..." />;
  }

  // Formatta la valuta
  const formatCurrency = (amount: any): string => {
    const numAmount = Number(amount);
    if (amount === undefined || amount === null || isNaN(numAmount)) {
      return '€0,00';
    }
    
    try {
      return `€${numAmount.toFixed(2)}`.replace('.', ',');
    } catch (error) {
      console.error('Errore durante la formattazione della valuta:', error, amount);
      return '€0,00';
    }
  };

  // Valori sicuri per le statistiche
  const safeStats = {
    balance: stats?.balance || 0,
    totalIncome: stats?.totalIncome || 0,
    totalExpense: stats?.totalExpense || 0,
    totalBudget: stats?.totalBudget || 0,
    budgetRemaining: stats?.budgetRemaining || 0,
    budgetPercentage: stats?.budgetPercentage || 0,
    recentTransactions: Array.isArray(stats?.recentTransactions)
      ? stats.recentTransactions
      : [],
    budgetStatus: Array.isArray(stats?.budgetStatus)
      ? stats.budgetStatus
      : [],
  };

  // Debug: verifica i dati ricevuti
  console.log('Dati dashboard per il periodo', selectedPeriod, ':', {
    balance: safeStats.balance,
    totalIncome: safeStats.totalIncome,
    totalExpense: safeStats.totalExpense,
    budgetPercentage: safeStats.budgetPercentage
  });

  // Funzione per renderizzare le transazioni
  const renderTransactions = () => {
    // Protezione nel caso non ci siano transazioni
    if (!safeStats.recentTransactions || safeStats.recentTransactions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
            Nessuna transazione recente
          </Text>
        </View>
      );
    }

    // Prendi solo le ultime 5 transazioni
    const recentTransactions = safeStats.recentTransactions.slice(0, 5);

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

  // Funzione per renderizzare i budget
  const renderBudgets = () => {
    if (!safeStats.budgetStatus || safeStats.budgetStatus.length === 0) {
      return (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
            Nessun budget impostato
          </Text>
        </View>
      );
    }

    return safeStats.budgetStatus.map((budget, index) => {
      const percentage = typeof budget.percentage === 'number' ? budget.percentage : 0;

      return (
        <View
          style={[styles.budgetItem, { backgroundColor: theme.colors.surface }]}
          key={`budget-${index}`}
        >
          <View style={styles.budgetHeader}>
            <View style={styles.categoryInfo}>
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: budget.categoryColor || '#ccc' },
                ]}
              />
              <Text style={[styles.budgetCategory, { color: theme.colors.text }]}>
                {budget.categoryName || 'Categoria'}
              </Text>
            </View>
            <Text
              style={[
                styles.budgetPercentage,
                {
                  color: percentage >= 100 ? theme.colors.error : theme.colors.text,
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
            <Text style={[styles.budgetSpent, { color: theme.colors.textSecondary }]}>
              Speso: {formatCurrency(budget.spent)}
            </Text>
            <Text style={[styles.budgetTotal, { color: theme.colors.textSecondary }]}>
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
        <Text style={[styles.subGreeting, { color: theme.colors.textSecondary }]}>
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
      <View style={[styles.balanceCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
          Bilancio del periodo
        </Text>
        <Text
          style={[
            styles.balanceAmount,
            {
              color: safeStats.balance >= 0 ? theme.colors.success : theme.colors.error,
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
              <Text style={[styles.incomeExpenseLabel, { color: theme.colors.text }]}>
                Entrate
              </Text>
            </View>
            <Text style={[styles.incomeAmount, { color: theme.colors.success }]}>
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
              <Text style={[styles.incomeExpenseLabel, { color: theme.colors.text }]}>
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
          onPress={() => navigation.navigate('AddTransaction', {})}
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
              navigation.navigate('Transactions', {
                screen: 'TransactionsList',
                params: {
                  showFilters: true,
                },
              });
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
    fontWeight: 'bold',
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
    shadowColor: '#000',
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
    fontWeight: 'bold',
    marginBottom: 20,
  },
  incomeExpenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incomeContainer: {
    flex: 1,
  },
  expenseContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  incomeExpenseLabel: {
    fontSize: 14,
    marginLeft: 4,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addTransactionButtonContainer: {
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 14,
  },
  emptyState: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: '500',
  },
  budgetPercentage: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  budgetValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetSpent: {
    fontSize: 14,
  },
  budgetTotal: {
    fontSize: 14,
  },
});
