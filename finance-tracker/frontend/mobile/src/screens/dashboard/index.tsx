import React, { useCallback, useMemo } from 'react';
import { View, FlatList, ScrollView, RefreshControl } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';

import { useBudJetStore } from '../../store';
import { BudgetCard } from '../../components/budget-card';
import { TransactionItem } from '../../components/transaction-item';
import { Button } from '../../components/common/button';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const { budgets, transactions, isLoading, setLoading } = useBudJetStore();
  
  // Ordina le transazioni per data (più recenti in cima)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5); // Mostra solo le 5 transazioni più recenti
  }, [transactions]);
  
  // Calcola il totale delle spese mensili
  const monthlyExpenses = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return transactions
      .filter(
        (transaction) => 
          transaction.isExpense &&
          transaction.date.getMonth() === currentMonth &&
          transaction.date.getFullYear() === currentYear
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);
  
  // Calcola il totale delle entrate mensili
  const monthlyIncome = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return transactions
      .filter(
        (transaction) => 
          !transaction.isExpense &&
          transaction.date.getMonth() === currentMonth &&
          transaction.date.getFullYear() === currentYear
      )
      .reduce((total, transaction) => total + transaction.amount, 0);
  }, [transactions]);
  
  // Formatta i valori monetari
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  const handleAddBudget = () => {
    // Qui potremmo navigare a una schermata per aggiungere un nuovo budget
    // Per ora, non abbiamo ancora creato questa schermata
    console.log('Aggiungi budget');
  };
  
  const handleViewAllTransactions = () => {
    // Qui potremmo navigare a una schermata che mostra tutte le transazioni
    // Per ora, non abbiamo ancora creato questa schermata
    console.log('Visualizza tutte le transazioni');
  };
  
  const handleTransactionPress = (transactionId: string) => {
    // Qui potremmo navigare a una schermata di dettaglio per la transazione
    // Per ora, non abbiamo ancora creato questa schermata
    console.log(`Visualizza transazione ${transactionId}`);
  };
  
  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Qui potremmo ricaricare i dati da un'API
    // Per ora, simuliamo solo un caricamento
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [setLoading]);
  
  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        <Header>
          <SummaryTitle>Riepilogo mensile</SummaryTitle>
          
          <SummaryContainer>
            <SummaryItem>
              <SummaryLabel>Spese</SummaryLabel>
              <SummaryValue isNegative>{formatCurrency(monthlyExpenses)}</SummaryValue>
            </SummaryItem>
            
            <SummaryDivider />
            
            <SummaryItem>
              <SummaryLabel>Entrate</SummaryLabel>
              <SummaryValue>{formatCurrency(monthlyIncome)}</SummaryValue>
            </SummaryItem>
            
            <SummaryDivider />
            
            <SummaryItem>
              <SummaryLabel>Totale</SummaryLabel>
              <SummaryValue isNegative={monthlyIncome - monthlyExpenses < 0}>
                {formatCurrency(monthlyIncome - monthlyExpenses)}
              </SummaryValue>
            </SummaryItem>
          </SummaryContainer>
        </Header>
        
        <Section>
          <SectionHeader>
            <SectionTitle>I tuoi budget</SectionTitle>
            <Button 
              title="Aggiungi" 
              variant="text" 
              size="small" 
              rightIcon="add-circle-outline"
              onPress={handleAddBudget}
            />
          </SectionHeader>
          
          {budgets.length > 0 ? (
            budgets.map((budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))
          ) : (
            <EmptyState>
              <EmptyStateText>
                Non hai ancora creato nessun budget. Crea il tuo primo budget per iniziare a tracciare le tue spese.
              </EmptyStateText>
              <Button 
                title="Crea il primo budget" 
                variant="primary"
                leftIcon="add-circle-outline"
                onPress={handleAddBudget}
                fullWidth
              />
            </EmptyState>
          )}
        </Section>
        
        <Section>
          <SectionHeader>
            <SectionTitle>Transazioni recenti</SectionTitle>
            <Button 
              title="Vedi tutte" 
              variant="text" 
              size="small" 
              rightIcon="chevron-forward-outline"
              onPress={handleViewAllTransactions}
            />
          </SectionHeader>
          
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction}
                onPress={() => handleTransactionPress(transaction.id)}
              />
            ))
          ) : (
            <EmptyState>
              <EmptyStateText>
                Non hai ancora registrato nessuna transazione. Aggiungi la tua prima transazione per iniziare a tracciare le tue spese.
              </EmptyStateText>
              <Button 
                title="Aggiungi transazione" 
                variant="primary"
                leftIcon="add-circle-outline"
                onPress={() => navigation.navigate('AddTransaction', {})}
                fullWidth
              />
            </EmptyState>
          )}
        </Section>
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
`;

const Header = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const SummaryTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const SummaryContainer = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  shadow-color: #000;
  shadow-offset: 0px 5px;
  elevation: 3;
`;

const SummaryItem = styled.View`
  flex: 1;
  align-items: center;
`;

const SummaryLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const SummaryValue = styled.Text<{ isNegative?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme, isNegative }) =>
    isNegative ? theme.colors.error : theme.colors.success};
`;

const SummaryDivider = styled.View`
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.border};
`;

const Section = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl}px;
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

const EmptyState = styled.View`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  align-items: center;
`;

const EmptyStateText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;