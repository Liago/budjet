import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { Budget } from '../../store';

interface BudgetCardProps {
  budget: Budget;
  onAddTransaction?: () => void;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export function BudgetCard({ budget, onAddTransaction }: BudgetCardProps) {
  const navigation = useNavigation<NavigationProp>();
  
  const percentUsed = useMemo(() => {
    const percent = (budget.currentAmount / budget.limit) * 100;
    // Limitiamo a 100% anche se abbiamo superato il limite
    return Math.min(percent, 100);
  }, [budget.currentAmount, budget.limit]);
  
  const isOverBudget = budget.currentAmount > budget.limit;
  
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(budget.currentAmount);
  }, [budget.currentAmount]);
  
  const formattedLimit = useMemo(() => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(budget.limit);
  }, [budget.limit]);
  
  const handleCardPress = () => {
    navigation.navigate('BudgetDetail', { budgetId: budget.id });
  };
  
  const handleAddTransaction = () => {
    if (onAddTransaction) {
      onAddTransaction();
    } else {
      navigation.navigate('AddTransaction', { budgetId: budget.id });
    }
  };
  
  return (
    <CardContainer onPress={handleCardPress}>
      <CardHeader>
        <IconContainer color={budget.colorTag}>
          <Ionicons name={budget.icon as any} size={24} color="white" />
        </IconContainer>
        
        <TitleContainer>
          <BudgetTitle>{budget.name}</BudgetTitle>
          <BudgetDates>{`${formatDate(budget.startDate)} - ${formatDate(budget.endDate)}`}</BudgetDates>
        </TitleContainer>
        
        <AddButton onPress={handleAddTransaction}>
          <Ionicons name="add" size={24} color="primary" />
        </AddButton>
      </CardHeader>
      
      <CardBody>
        <AmountContainer>
          <AmountText isOverBudget={isOverBudget}>{formattedAmount}</AmountText>
          <LimitText>{` / ${formattedLimit}`}</LimitText>
        </AmountContainer>
        
        <ProgressBarContainer>
          <ProgressBar 
            percentUsed={percentUsed} 
            isOverBudget={isOverBudget} 
          />
        </ProgressBarContainer>
      </CardBody>
    </CardContainer>
  );
}

// Funzione di utilità per formattare le date
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const CardContainer = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  shadow-color: #000;
  shadow-offset: 0px 5px;
  elevation: 3;
`;

const CardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const IconContainer = styled.View<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ color }) => color};
  justify-content: center;
  align-items: center;
`;

const TitleContainer = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

const BudgetTitle = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const BudgetDates = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const AddButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const CardBody = styled.View``;

const AmountContainer = styled.View`
  flex-direction: row;
  align-items: baseline;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const AmountText = styled.Text<{ isOverBudget: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme, isOverBudget }) =>
    isOverBudget ? theme.colors.error : theme.colors.text};
`;

const LimitText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ProgressBarContainer = styled.View`
  height: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.View<{ percentUsed: number; isOverBudget: boolean }>`
  width: ${({ percentUsed }) => `${percentUsed}%`};
  height: 100%;
  background-color: ${({ theme, isOverBudget }) =>
    isOverBudget ? theme.colors.error : theme.colors.success};
`;