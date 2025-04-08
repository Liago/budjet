import React, { useState, useMemo, useEffect } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import styled from "styled-components/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAppDispatch, useAppSelector } from "../../store";
import { Button } from "../../components/common/button";
import { fetchDashboardStats } from "../../store/slices/dashboardSlice";
import { fetchTransactions } from "../../store/slices/transactionSlice";
import { Transaction } from "../../types";

// Impostiamo la larghezza per i grafici
const screenWidth = Dimensions.get("window").width;

// Periodi di tempo per i filtri
type TimePeriod = "week" | "month" | "year" | "all";

// Funzione per calcolare il range di date in base al periodo selezionato
function getDateRange(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  let end = new Date();
  let start = new Date();

  switch (period) {
    case "week":
      // Settimana corrente (da Lunedì a Domenica)
      const day = now.getDay() || 7; // 0 è Domenica nella getDay(), ma vogliamo 7
      start.setDate(now.getDate() - day + 1); // Lunedì di questa settimana
      end.setDate(now.getDate() + (7 - day)); // Domenica di questa settimana
      break;
    case "month":
      // Mese corrente
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "year":
      // Anno corrente
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
    case "all":
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

// Funzione per filtrare le transazioni in base al periodo selezionato
function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: TimePeriod
): Transaction[] {
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
    const categoryName = transaction.category?.name || "Altra";
    const amount = Number(transaction.amount) || 0;
    const isExpense = transaction.type === "EXPENSE";

    if (isExpense) {
      expensesByCategory[categoryName] =
        (expensesByCategory[categoryName] || 0) + amount;
    } else {
      incomesByCategory[categoryName] =
        (incomesByCategory[categoryName] || 0) + amount;
    }
  });

  return { expensesByCategory, incomesByCategory };
}

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Otteniamo i dati dal Redux store
  const { stats } = useAppSelector((state) => state.dashboard);
  const { transactions } = useAppSelector((state) => state.transaction);

  // Stato per il periodo selezionato
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month");

  // Stato per la vista attiva (spese o entrate)
  const [activeView, setActiveView] = useState<"expenses" | "income">(
    "expenses"
  );

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
    return Object.values(expensesByCategory).reduce(
      (sum: number, amount: number) => sum + amount,
      0
    );
  }, [expensesByCategory]);

  const totalIncome = useMemo(() => {
    return Object.values(incomesByCategory).reduce(
      (sum: number, amount: number) => sum + amount,
      0
    );
  }, [incomesByCategory]);

  // Prepara i dati per il grafico a torta
  const pieChartData = useMemo(() => {
    const categories =
      activeView === "expenses" ? expensesByCategory : incomesByCategory;
    const total = activeView === "expenses" ? totalExpenses : totalIncome;

    // Converti l'oggetto in array di oggetti per facilitare la renderizzazione
    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount: Number(amount),
        percentage: total > 0 ? (Number(amount) / total) * 100 : 0,
      }))
      .sort((a, b) => Number(b.amount) - Number(a.amount)); // Ordina per importo decrescente
  }, [
    expensesByCategory,
    incomesByCategory,
    totalExpenses,
    totalIncome,
    activeView,
  ]);

  // Formatta i valori monetari
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Colori per il grafico a torta
  const categoryColors: Record<string, string> = {
    Cibo: "#FF6B6B",
    Trasporto: "#4ECDC4",
    Casa: "#45B7D1",
    Intrattenimento: "#FFA500",
    Salute: "#98D8C8",
    Shopping: "#F06292",
    Utenze: "#64B5F6",
    Stipendio: "#66BB6A",
    Investimenti: "#9575CD",
    Regali: "#FFD54F",
    Vendite: "#4DB6AC",
    Altro: "#90A4AE",
  };

  // Restituisce un colore per una categoria (con fallback per categorie non mappate)
  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "#90A4AE";
  };

  // Gestisce il cambio di periodo
  const handlePeriodChange = (period: TimePeriod) => {
    setSelectedPeriod(period);
  };

  // Gestisce il cambio di vista (spese o entrate)
  const handleViewChange = (view: "expenses" | "income") => {
    setActiveView(view);
  };

  // Effetto per caricare i dati all'avvio
  useEffect(() => {
    // Carica i dati del dashboard quando il componente si monta
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

        console.log(
          "Caricamento dati statistiche dal",
          startDate,
          "al",
          endDate
        );

        // Prima carica le transazioni, poi i dati della dashboard
        await dispatch(
          fetchTransactions({
            startDate,
            endDate,
            limit: 100,
          })
        );

        await dispatch(fetchDashboardStats({ startDate, endDate }));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadData();
  }, [dispatch]);

  // Ensure budget stats are defined before rendering with default safe values
  const safeBudgetStats = useMemo(() => {
    return {
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
  }, [stats]);

  // Renderizza i budget
  const renderBudgets = () => {
    if (
      !safeBudgetStats.budgetStatus ||
      safeBudgetStats.budgetStatus.length === 0
    ) {
      return (
        <EmptyStateCard>
          <EmptyStateText>Nessun budget impostato</EmptyStateText>
        </EmptyStateCard>
      );
    }

    return safeBudgetStats.budgetStatus.map((budget: any, index: number) => {
      const percentage =
        typeof budget.percentage === "number" ? budget.percentage : 0;

      // Usiamo React.Fragment con key per risolvere il problema del key
      return (
        <React.Fragment key={`budget-${index}`}>
          <BudgetCard>
            <BudgetHeader>
              <CategoryInfo>
                <CategoryDot
                  style={{ backgroundColor: budget.categoryColor || "#ccc" }}
                />
                <BudgetCategory>
                  {budget.categoryName || "Categoria"}
                </BudgetCategory>
              </CategoryInfo>
              <BudgetPercentage percentage={percentage > 100}>
                {percentage.toFixed(0)}%
              </BudgetPercentage>
            </BudgetHeader>

            <ProgressBarContainer>
              <ProgressBar
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor:
                    percentage >= 100
                      ? "#ef4444" // rosso
                      : percentage >= 80
                      ? "#f59e0b" // arancione
                      : "#10b981", // verde
                }}
              />
            </ProgressBarContainer>

            <BudgetValues>
              <BudgetSpent>Speso: {formatCurrency(budget.spent)}</BudgetSpent>
              <BudgetTotal>Budget: {formatCurrency(budget.budget)}</BudgetTotal>
            </BudgetValues>
          </BudgetCard>
        </React.Fragment>
      );
    });
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
              isSelected={selectedPeriod === "week"}
              onPress={() => handlePeriodChange("week")}
            >
              <PeriodText isSelected={selectedPeriod === "week"}>
                Settimana
              </PeriodText>
            </PeriodButton>

            <PeriodButton
              isSelected={selectedPeriod === "month"}
              onPress={() => handlePeriodChange("month")}
            >
              <PeriodText isSelected={selectedPeriod === "month"}>
                Mese
              </PeriodText>
            </PeriodButton>

            <PeriodButton
              isSelected={selectedPeriod === "year"}
              onPress={() => handlePeriodChange("year")}
            >
              <PeriodText isSelected={selectedPeriod === "year"}>
                Anno
              </PeriodText>
            </PeriodButton>

            <PeriodButton
              isSelected={selectedPeriod === "all"}
              onPress={() => handlePeriodChange("all")}
            >
              <PeriodText isSelected={selectedPeriod === "all"}>
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
              <SummaryValue isNegative>
                {formatCurrency(totalExpenses)}
              </SummaryValue>
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
            isSelected={activeView === "expenses"}
            onPress={() => handleViewChange("expenses")}
          >
            <ViewButtonText isSelected={activeView === "expenses"}>
              Spese
            </ViewButtonText>
          </ViewButton>

          <ViewButton
            isSelected={activeView === "income"}
            onPress={() => handleViewChange("income")}
          >
            <ViewButtonText isSelected={activeView === "income"}>
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
                    {formatCurrency(
                      activeView === "expenses" ? totalExpenses : totalIncome
                    )}
                  </TotalAmount>
                </PieChartPlaceholder>

                <Legend>
                  {pieChartData.map(({ category, amount, percentage }) => (
                    <LegendItem key={category}>
                      <ColorIndicator color={getCategoryColor(category)} />
                      <LegendText>
                        {`${category}: ${formatCurrency(
                          amount
                        )} (${percentage.toFixed(1)}%)`}
                      </LegendText>
                    </LegendItem>
                  ))}
                </Legend>
              </PieChartVisual>
            </>
          ) : (
            <EmptyState>
              <EmptyStateText>
                {`Nessuna ${
                  activeView === "expenses" ? "spesa" : "entrata"
                } registrata nel periodo selezionato.`}
              </EmptyStateText>
            </EmptyState>
          )}
        </ChartContainer>

        {/* Aggiungi la sezione budget */}
        <SectionTitle>Stato budget</SectionTitle>
        {renderBudgets()}
      </ScrollView>
    </Container>
  );
}

// Funzione helper per ottenere il testo del range di date
function getDateRangeText(period: TimePeriod): string {
  const { start, end } = getDateRange(period);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  switch (period) {
    case "week":
      return `${formatDate(start)} - ${formatDate(end)}`;
    case "month":
      const months = [
        "Gennaio",
        "Febbraio",
        "Marzo",
        "Aprile",
        "Maggio",
        "Giugno",
        "Luglio",
        "Agosto",
        "Settembre",
        "Ottobre",
        "Novembre",
        "Dicembre",
      ];
      return `${months[start.getMonth()]} ${start.getFullYear()}`;
    case "year":
      return `${start.getFullYear()}`;
    case "all":
      return "Tutti i periodi";
    default:
      return "";
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
    isSelected ? theme.colors.primary : "transparent"};
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
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: ${({ theme }) => theme.spacing.md}px 0;
`;

const ViewSelector = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

interface ViewButtonProps {
  isSelected: boolean;
}

const ViewButton = styled.TouchableOpacity<ViewButtonProps>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : "transparent"};
`;

interface ViewButtonTextProps {
  isSelected: boolean;
}

const ViewButtonText = styled.Text<ViewButtonTextProps>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.surface : theme.colors.textSecondary};
`;

const ChartContainer = styled.View`
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

const PieChartVisual = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PieChartPlaceholder = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const TotalAmount = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const Legend = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ColorIndicator = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

const LegendText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const EmptyStateText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const EmptyStateCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  justify-content: center;
`;

const SectionTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const BudgetCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const BudgetHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const CategoryInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const CategoryDot = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  margin-right: ${({ theme }) => theme.spacing.md}px;
`;

const BudgetCategory = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.text};
`;

const BudgetPercentage = styled.Text<{ percentage: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme, percentage }) =>
    percentage ? theme.colors.error : theme.colors.success};
`;

const ProgressBarContainer = styled.View`
  height: 12px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ProgressBar = styled.View`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
`;

const BudgetValues = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BudgetSpent = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const BudgetTotal = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.text};
`;
