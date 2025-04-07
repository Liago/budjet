import React, { useMemo } from 'react';
import { View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../store';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const formattedAmount = useMemo(() => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(transaction.amount);
  }, [transaction.amount]);
  
  const formattedDate = useMemo(() => {
    return formatDate(transaction.date);
  }, [transaction.date]);

  // Determina l'icona in base alla categoria
  const getCategoryIcon = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'cibo':
      case 'ristorante':
        return 'restaurant-outline';
      case 'trasporto':
        return 'car-outline';
      case 'casa':
        return 'home-outline';
      case 'intrattenimento':
        return 'film-outline';
      case 'salute':
        return 'medical-outline';
      case 'shopping':
        return 'cart-outline';
      case 'stipendio':
        return 'cash-outline';
      case 'utenze':
        return 'flash-outline';
      default:
        return 'wallet-outline';
    }
  };

  return (
    <ItemContainer onPress={onPress}>
      <IconContainer isExpense={transaction.isExpense}>
        <Ionicons 
          name={getCategoryIcon(transaction.category)} 
          size={24} 
          color="white" 
        />
      </IconContainer>
      
      <InfoContainer>
        <MainInfo>
          <Description>{transaction.description}</Description>
          <Amount isExpense={transaction.isExpense}>
            {transaction.isExpense ? '-' : '+'}{formattedAmount}
          </Amount>
        </MainInfo>
        
        <SecondaryInfo>
          <Category>{transaction.category}</Category>
          <Date>{formattedDate}</Date>
        </SecondaryInfo>
      </InfoContainer>
    </ItemContainer>
  );
}

// Funzione di utilità per formattare le date
function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const ItemContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const IconContainer = styled.View<{ isExpense: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${({ theme, isExpense }) =>
    isExpense ? theme.colors.error : theme.colors.success};
  justify-content: center;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing.sm}px;
`;

const InfoContainer = styled.View`
  flex: 1;
  justify-content: space-between;
`;

const MainInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const Description = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
  flex: 1;
`;

const Amount = styled.Text<{ isExpense: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme, isExpense }) =>
    isExpense ? theme.colors.error : theme.colors.success};
`;

const SecondaryInfo = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const Category = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Date = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;