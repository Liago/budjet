import React, { useMemo } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../../navigation';
import { useBudJetStore, Transaction } from '../../store';
import { Button } from '../../components/common/button';
import { TransactionItem } from '../../components/transaction-item';

type NavigationProp = StackNavigationProp<RootStackParamList, 'BudgetDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'BudgetDetail'>;

// Funzione helper per raggruppare le transazioni per data
function groupTransactionsByDate(transactions: Transaction[]) {
  const groups: { [key: string]: Transaction[] } = {};
  
  transactions.forEach((transaction) => {
    const dateKey = transaction.date.toISOString().split('T')[0];
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(transaction);
  });
  
  // Ordina le chiavi per data (dalla più recente alla meno recente)
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
  return { groups, sortedKeys };
}

// Funzione helper per formattare la data
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export default function BudgetDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  
  const { budgetId } = route.params;
  const { budgets, transactions, deleteBudget } = useBudJetStore();
  
  // Trova il budget corrente
  const budget = budgets.find((b) => b.id === budgetId);
  
  // Se il budget non esiste, torna alla schermata precedente
  if (!budget) {
    Alert.alert('Errore', 'Budget non trovato');
    navigation.goBack();
    return null;
  }
  
  // Recupera le transazioni relative a questo budget
  const budgetTransactions = useMemo(() => {
    return transactions.filter((transaction) => transaction.budgetId === budgetId);
  }, [transactions, budgetId]);
  
  // Raggruppa le transazioni per data
  const { groups, sortedKeys } = useMemo(() => {
    return groupTransactionsByDate(budgetTransactions);
  }, [budgetTransactions]);
  
  // Calcola le statistiche del budget
  const stats = useMemo(() => {
    const totalExpenses = budgetTransactions
      .filter((t) => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = budgetTransactions
      .filter((t) => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const transactionsCount = budgetTransactions.length;
    const expensesCount = budgetTransactions.filter((t) => t.isExpense).length;
    const incomeCount = transactionsCount - expensesCount;
    
    const remaining = budget.limit - budget.currentAmount;
    const percentUsed = (budget.currentAmount / budget.limit) * 100;
    
    return {
      totalExpenses,
      totalIncome,
      transactionsCount,
      expensesCount,
      incomeCount,
      remaining,
      percentUsed: Math.min(percentUsed, 100), // Limitiamo a 100% anche se abbiamo superato il budget
    };
  }, [budgetTransactions, budget]);
  
  // Formatta i valori monetari
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Gestisce l'eliminazione del budget
  const handleDeleteBudget = () => {
    Alert.alert(
      'Elimina budget',
      'Sei sicuro di voler eliminare questo budget? Tutte le transazioni associate verranno eliminate.',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            deleteBudget(budgetId);
            navigation.goBack();
          },
        },
      ]
    );
  };
  
  // Gestisce l'aggiunta di una nuova transazione
  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction', { budgetId });
  };
  
  // Gestisce la modifica del budget
  const handleEditBudget = () => {
    // Per ora, mostriamo solo un messaggio
    Alert.alert(
      'Modifica budget',
      'Questa funzionalità sarà implementata in futuro'
    );
  };
  
  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
        }}
      >
        <Header>
          <BudgetInfoContainer>
            <IconContainer color={budget.colorTag}>
              <Ionicons name={budget.icon as any} size={32} color="white" />
            </IconContainer>
            
            <BudgetInfo>
              <BudgetName>{budget.name}</BudgetName>
              <BudgetPeriod>
                {`Periodo: ${formatDate(budget.startDate.toISOString())} - ${formatDate(budget.endDate.toISOString())}`}
              </BudgetPeriod>
            </BudgetInfo>
          </BudgetInfoContainer>
          
          <ButtonsContainer>
            <ActionButton onPress={handleEditBudget}>
              <Ionicons name="create-outline" size={24} color="primary" />
            </ActionButton>
            
            <ActionButton onPress={handleDeleteBudget}>
              <Ionicons name="trash-outline" size={24} color="error" />
            </ActionButton>
          </ButtonsContainer>
        </Header>
        
        <BudgetStatsContainer>
          <BudgetAmount>
            <AmountLabel>Totale speso</AmountLabel>
            <AmountValue isNegative={budget.currentAmount > budget.limit}>
              {formatCurrency(budget.currentAmount)}
            </AmountValue>
            <AmountLimit>{`/ ${formatCurrency(budget.limit)}`}</AmountLimit>
          </BudgetAmount>
          
          <ProgressContainer>
            <ProgressBar 
              percentUsed={stats.percentUsed} 
              isOverBudget={budget.currentAmount > budget.limit} 
            />
            <ProgressLabel isNegative={budget.currentAmount > budget.limit}>
              {budget.currentAmount > budget.limit
                ? 'Budget superato!'
                : `Rimasti: ${formatCurrency(stats.remaining)}`}
            </ProgressLabel>
          </ProgressContainer>
        </BudgetStatsContainer>
        
        <StatsSummary>
          <StatItem>
            <StatValue>{stats.transactionsCount}</StatValue>
            <StatLabel>Transazioni</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{stats.expensesCount}</StatValue>
            <StatLabel>Spese</StatLabel>
          </StatItem>
          
          <StatItem>
            <StatValue>{stats.incomeCount}</StatValue>
            <StatLabel>Entrate</StatLabel>
          </StatItem>
        </StatsSummary>
        
        <TransactionSection>
          <SectionHeader>
            <SectionTitle>Transazioni</SectionTitle>
            <Button
              title="Aggiungi"
              variant="text"
              size="small"
              rightIcon="add-circle-outline"
              onPress={handleAddTransaction}
            />
          </SectionHeader>
          
          {budgetTransactions.length > 0 ? (
            <>
              {sortedKeys.map((dateKey) => (
                <View key={dateKey}>
                  <DateDivider>
                    <DateLabel>{formatDate(dateKey)}</DateLabel>
                  </DateDivider>
                  
                  {groups[dateKey].map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      onPress={() => {
                        // Qui potremmo navigare ai dettagli della transazione
                        Alert.alert(
                          'Dettagli Transazione',
                          'Questa funzionalità sarà implementata in futuro'
                        );
                      }}
                    />
                  ))}
                </View>
              ))}
            </>
          ) : (
            <EmptyState>
              <EmptyStateText>
                Non ci sono transazioni per questo budget. Aggiungi la tua prima transazione.
              </EmptyStateText>
              <Button
                title="Aggiungi transazione"
                variant="primary"
                leftIcon="add-circle-outline"
                onPress={handleAddTransaction}
                fullWidth
              />
            </EmptyState>
          )}
        </TransactionSection>
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const BudgetInfoContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.View<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${({ color }) => color};
  justify-content: center;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

const BudgetInfo = styled.View``;

const BudgetName = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const BudgetPeriod = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
`;

const ActionButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const BudgetStatsContainer = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const BudgetAmount = styled.View`
  flex-direction: row;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const AmountLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

const AmountValue = styled.Text<{ isNegative: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme, isNegative }) =>
    isNegative ? theme.colors.error : theme.colors.text};
`;

const AmountLimit = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: ${({ theme }) => theme.spacing.xs}px;
`;

const ProgressContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const ProgressBar = styled.View<{ percentUsed: number; isOverBudget: boolean }>`
  width: ${({ percentUsed }) => `${percentUsed}%`};
  height: 8px;
  background-color: ${({ theme, isOverBudget }) =>
    isOverBudget ? theme.colors.error : theme.colors.success};
  border-radius: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const ProgressLabel = styled.Text<{ isNegative: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme, isNegative }) =>
    isNegative ? theme.colors.error : theme.colors.success};
  text-align: right;
`;

const StatsSummary = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const StatItem = styled.View`
  flex: 1;
  align-items: center;
`;

const StatValue = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const StatLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TransactionSection = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const DateDivider = styled.View`
  margin-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const DateLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const EmptyState = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const EmptyStateText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;