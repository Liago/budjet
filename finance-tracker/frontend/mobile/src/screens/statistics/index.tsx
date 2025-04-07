import React, { useState, useMemo } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useBudJetStore, Transaction } from '../../store';
import { Button } from '../../components/common/button';

// Impostiamo la larghezza per i grafici
const screenWidth = Dimensions.get('window').width;

// Periodi di tempo per i filtri
type TimePeriod = 'week' | 'month' | 'year' | 'all';

// Funzione per calcolare il range di date in base al periodo selezionato
function getDateRange(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date();
  let start = new Date();
  
  switch (period) {
    case 'week':
      // Settimana corrente (da Lunedì a Domenica)
      const day = now.getDay() || 7; // 0 è Domenica nella getDay(), ma vogliamo 7
      start.setDate(now.getDate() - day + 1); // Lunedì di questa settimana
      end.setDate(now.getDate() + (7 - day)); // Domenica di questa settimana
      break;
    case 'month':
      // Mese corrente
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'year':
      // Anno corrente
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
    case 'all':
    default:
      // Tutti i tempi (ultimi 10 anni per avere un range ragionevole)
      start = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
      break;
  }
  
  // Reset di ore, minuti, secondi e millisecondi per avere date precise
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
}

// Funzione per filtrare le transazioni in base al periodo
function filterTransactionsByPeriod(transactions: Transaction[], period: TimePeriod): Transaction[] {
  const { start, end } = getDateRange(period);
  
  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= start && transactionDate <= end;
  });
}

// Funzione per raggruppare le transazioni per categoria
function groupTransactionsByCategory(transactions: Transaction[]) {
  const expensesByCategory: Record<string, number> = {};
  const incomesByCategory: Record<string, number> = {};
  
  transactions.forEach((transaction) => {
    const { category, amount, isExpense } = transaction;
    
    if (isExpense) {
      expensesByCategory[category] = (expensesByCategory[category] || 0) + amount;
    } else {
      incomesByCategory[category] = (incomesByCategory[category] || 0) + amount;
    }
  });
  
  return { expensesByCategory, incomesByCategory };
}

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions } = useBudJetStore();
  
  // Stato per il periodo selezionato
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  
  // Stato per la vista attiva (spese o entrate)
  const [activeView, setActiveView] = useState<'expenses' | 'income'>('expenses');
  
  // Filtra le transazioni in base al periodo selezionato
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, selectedPeriod);
  }, [transactions, selectedPeriod]);
  
  // Raggruppa le transazioni per categoria
  const { expensesByCategory, incomesByCategory } = useMemo(() => {
    return groupTransactionsByCategory(filteredTransactions);
  }, [filteredTransactions]);
  
  // Calcola i totali
  const totalExpenses = useMemo(() => {
    return Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
  }, [expensesByCategory]);
  
  const totalIncome = useMemo(() => {
    return Object.values(incomesByCategory).reduce((sum, amount) => sum + amount, 0);
  }, [incomesByCategory]);
  
  // Prepara i dati per il grafico a torta
  const pieChartData = useMemo(() => {
    const categories = activeView === 'expenses' ? expensesByCategory : incomesByCategory;
    const total = activeView === 'expenses' ? totalExpenses : totalIncome;
    
    // Converti l'oggetto in array di oggetti per facilitare la renderizzazione
    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount); // Ordina per importo decrescente
  }, [expensesByCategory, incomesByCategory, totalExpenses, totalIncome, activeView]);
  
  // Formatta i valori monetari
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Colori per il grafico a torta
  const categoryColors: Record<string, string> = {
    'Cibo': '#FF6B6B',
    'Trasporto': '#4ECDC4',
    'Casa': '#45B7D1',
    'Intrattenimento': '#FFA500',
    'Salute': '#98D8C8',
    'Shopping': '#F06292',
    'Utenze': '#64B5F6',
    'Stipendio': '#66BB6A',
    'Investimenti': '#9575CD',
    'Regali': '#FFD54F',
    'Vendite': '#4DB6AC',
    'Altro': '#90A4AE',
  };
  
  // Restituisce un colore per una categoria (con fallback per categorie non mappate)
  const getCategoryColor = (category: string) => {
    return categoryColors[category] || '#90A4AE';
  };
  
  // Gestisce il cambio di periodo
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };
  
  // Gestisce il cambio di vista (spese o entrate)
  const handleViewChange = (view: 'expenses' | 'income') => {
    setActiveView(view);
  };
  
  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
      >
        <Header>
          <Title>Statistiche</Title>
          
          <PeriodSelector>
            <PeriodButton
              isSelected={selectedPeriod === 'week'}
              onPress={() => handlePeriodChange('week')}
            >
              <PeriodText isSelected={selectedPeriod === 'week'}>
                Settimana
              </PeriodText>
            </PeriodButton>
            
            <PeriodButton
              isSelected={selectedPeriod === 'month'}
              onPress={() => handlePeriodChange('month')}
            >
              <PeriodText isSelected={selectedPeriod === 'month'}>
                Mese
              </PeriodText>
            </PeriodButton>
            
            <PeriodButton
              isSelected={selectedPeriod === 'year'}
              onPress={() => handlePeriodChange('year')}
            >
              <PeriodText isSelected={selectedPeriod === 'year'}>
                Anno
              </PeriodText>
            </PeriodButton>
            
            <PeriodButton
              isSelected={selectedPeriod === 'all'}
              onPress={() => handlePeriodChange('all')}
            >
              <PeriodText isSelected={selectedPeriod === 'all'}>
                Tutti
              </PeriodText>
            </PeriodButton>
          </PeriodSelector>
        </Header>
        
        <SummaryCard>
          <SummaryHeader>
            <SummaryTitle>Riepilogo</SummaryTitle>
            <DateRange>{getDateRangeText(selectedPeriod)}</DateRange>
          </SummaryHeader>
          
          <SummaryContent>
            <SummaryItem>
              <SummaryLabel>Spese</SummaryLabel>
              <SummaryValue isNegative>{formatCurrency(totalExpenses)}</SummaryValue>
            </SummaryItem>
            
            <SummaryDivider />
            
            <SummaryItem>
              <SummaryLabel>Entrate</SummaryLabel>
              <SummaryValue>{formatCurrency(totalIncome)}</SummaryValue>
            </SummaryItem>
            
            <SummaryDivider />
            
            <SummaryItem>
              <SummaryLabel>Saldo</SummaryLabel>
              <SummaryValue isNegative={totalIncome - totalExpenses < 0}>
                {formatCurrency(totalIncome - totalExpenses)}
              </SummaryValue>
            </SummaryItem>
          </SummaryContent>
        </SummaryCard>
        
        <ViewSelector>
          <ViewButton
            isSelected={activeView === 'expenses'}
            onPress={() => handleViewChange('expenses')}
          >
            <ViewButtonText isSelected={activeView === 'expenses'}>
              Spese
            </ViewButtonText>
          </ViewButton>
          
          <ViewButton
            isSelected={activeView === 'income'}
            onPress={() => handleViewChange('income')}
          >
            <ViewButtonText isSelected={activeView === 'income'}>
              Entrate
            </ViewButtonText>
          </ViewButton>
        </ViewSelector>
        
        <ChartContainer>
          {pieChartData.length > 0 ? (
            <>
              <PieChartVisual>
                {/* Qui potremmo renderizzare un vero grafico a torta con una libreria come 'react-native-svg-charts' */}
                {/* Per ora, mostriamo una rappresentazione visiva semplificata */}
                <PieChartPlaceholder>
                  <Ionicons name="pie-chart" size={120} color="primary" />
                  <TotalAmount>
                    {formatCurrency(activeView === 'expenses' ? totalExpenses : totalIncome)}
                  </TotalAmount>
                </PieChartPlaceholder>
                
                <Legend>
                  {pieChartData.map(({ category, amount, percentage }) => (
                    <LegendItem key={category}>
                      <ColorIndicator color={getCategoryColor(category)} />
                      <LegendText>
                        {`${category}: ${formatCurrency(amount)} (${percentage.toFixed(1)}%)`}
                      </LegendText>
                    </LegendItem>
                  ))}
                </Legend>
              </PieChartVisual>
            </>
          ) : (
            <EmptyState>
              <EmptyStateText>
                {`Nessuna ${activeView === 'expenses' ? 'spesa' : 'entrata'} registrata nel periodo selezionato.`}
              </EmptyStateText>
            </EmptyState>
          )}
        </ChartContainer>
      </ScrollView>
    </Container>
  );
}

// Funzione helper per ottenere il testo del range di date
function getDateRangeText(period: TimePeriod): string {
  const { start, end } = getDateRange(period);
  
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  switch (period) {
    case 'week':
      return `${formatDate(start)} - ${formatDate(end)}`;
    case 'month':
      const months = [
        'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
      ];
      return `${months[start.getMonth()]} ${start.getFullYear()}`;
    case 'year':
      return `${start.getFullYear()}`;
    case 'all':
      return 'Tutti i periodi';
    default:
      return '';
  }
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const PeriodSelector = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

interface PeriodButtonProps {
  isSelected: boolean;
}

const PeriodButton = styled.TouchableOpacity<PeriodButtonProps>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : 'transparent'};
`;

interface PeriodTextProps {
  isSelected: boolean;
}

const PeriodText = styled.Text<PeriodTextProps>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.surface : theme.colors.textSecondary};
`;

const SummaryCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  shadow-color: #000;
  shadow-offset: 0px 5px;
  elevation: 3;
`;

const SummaryHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const SummaryTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const DateRange = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const SummaryContent = styled.View`
  flex-direction: row;
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
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme, isNegative }) =>
    isNegative ? theme.colors.error : theme.colors.success};
`;

const SummaryDivider = styled.View`
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.border};
`;

const ViewSelector = styled.View`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

interface ViewButtonProps {
  isSelected: boolean;
}

const ViewButton = styled.TouchableOpacity<ViewButtonProps>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : 'transparent'};
`;

interface ViewButtonTextProps {
  isSelected: boolean;
}

const ViewButtonText = styled.Text<ViewButtonTextProps>`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.surface : theme.colors.textSecondary};
`;

const ChartContainer = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const PieChartVisual = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const PieChartPlaceholder = styled.View`
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
  position: relative;
`;

const TotalAmount = styled.Text`
  position: absolute;
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const Legend = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const ColorIndicator = styled.View<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 8px;
  background-color: ${({ color }) => color};
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

const LegendText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyState = styled.View`
  padding: ${({ theme }) => theme.spacing.xl}px;
  align-items: center;
  justify-content: center;
`;

const EmptyStateText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;