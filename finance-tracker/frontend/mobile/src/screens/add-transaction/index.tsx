import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as z from 'zod';

import { RootStackParamList } from '../../navigation';
import { useBudJetStore, Budget } from '../../store';
import { Input } from '../../components/common/input';
import { Button } from '../../components/common/button';

type NavigationProp = StackNavigationProp<RootStackParamList, 'AddTransaction'>;
type RouteProps = RouteProp<RootStackParamList, 'AddTransaction'>;

// Schema di validazione per la transazione
const transactionSchema = z.object({
  description: z.string().min(1, 'La descrizione è obbligatoria'),
  amount: z.number().positive('L\'importo deve essere maggiore di zero'),
  category: z.string().min(1, 'La categoria è obbligatoria'),
  budgetId: z.string().min(1, 'Seleziona un budget'),
  date: z.date(),
  isExpense: z.boolean(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

// Categorie predefinite per entrate e spese
const expenseCategories = [
  'Cibo', 'Trasporto', 'Casa', 'Intrattenimento', 
  'Salute', 'Shopping', 'Utenze', 'Altro'
];

const incomeCategories = [
  'Stipendio', 'Investimenti', 'Regali', 'Vendite', 'Altro'
];

export default function AddTransactionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  
  const { budgets, addTransaction } = useBudJetStore();
  
  // Stato per il form
  const [formData, setFormData] = useState<Partial<TransactionFormData>>({
    description: '',
    amount: undefined,
    category: '',
    budgetId: route.params?.budgetId || '',
    date: new Date(),
    isExpense: true,
  });
  
  // Gestione errori
  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});
  
  // Se è specificato un budget nell'URL, lo impostiamo come selezionato
  useEffect(() => {
    if (route.params?.budgetId) {
      setFormData((prev) => ({
        ...prev,
        budgetId: route.params.budgetId,
      }));
    }
  }, [route.params?.budgetId]);
  
  // Gestisce il cambiamento di tipo (entrata/uscita)
  const handleTypeChange = (isExpense: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isExpense,
      category: '', // Reset della categoria quando cambia il tipo
    }));
  };
  
  // Gestisce il cambiamento nei campi del form
  const handleChange = (field: keyof TransactionFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Reset dell'errore per il campo modificato
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };
  
  // Validazione del form
  const validateForm = (): boolean => {
    try {
      // Converte l'importo in numero
      const parsedAmount = formData.amount 
        ? parseFloat(formData.amount.toString().replace(',', '.')) 
        : 0;
      
      transactionSchema.parse({
        ...formData,
        amount: parsedAmount,
      });
      
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};
        
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof TransactionFormData;
          newErrors[path] = err.message;
        });
        
        setErrors(newErrors);
      }
      
      return false;
    }
  };
  
  // Gestisce il submit del form
  const handleSubmit = () => {
    if (validateForm()) {
      // Converti l'importo in numero
      const parsedAmount = parseFloat(
        formData.amount.toString().replace(',', '.')
      );
      
      // Aggiungi la transazione
      addTransaction({
        description: formData.description,
        amount: parsedAmount,
        category: formData.category,
        budgetId: formData.budgetId,
        date: formData.date,
        isExpense: formData.isExpense,
      });
      
      // Mostra un messaggio di successo
      Alert.alert(
        'Successo',
        'Transazione aggiunta con successo',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };
  
  // Trova il budget selezionato
  const selectedBudget = budgets.find((budget) => budget.id === formData.budgetId);
  
  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
      >
        <TypeSelector>
          <TypeButton
            isSelected={formData.isExpense}
            isExpense
            onPress={() => handleTypeChange(true)}
          >
            <TypeButtonText isSelected={formData.isExpense}>
              Spesa
            </TypeButtonText>
          </TypeButton>
          
          <TypeButton
            isSelected={!formData.isExpense}
            isExpense={false}
            onPress={() => handleTypeChange(false)}
          >
            <TypeButtonText isSelected={!formData.isExpense}>
              Entrata
            </TypeButtonText>
          </TypeButton>
        </TypeSelector>
        
        <Input
          label="Descrizione"
          placeholder="Es. Spesa al supermercato"
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
          error={errors.description}
          leftIcon="create-outline"
          autoCapitalize="sentences"
        />
        
        <Input
          label="Importo (€)"
          placeholder="0.00"
          value={formData.amount?.toString() || ''}
          onChangeText={(value) => {
            // Permette solo numeri, punto e virgola
            const sanitizedValue = value.replace(/[^0-9.,]/g, '');
            handleChange('amount', sanitizedValue);
          }}
          error={errors.amount}
          leftIcon="cash-outline"
          keyboardType="decimal-pad"
        />
        
        <CategoryLabel>Categoria</CategoryLabel>
        <CategoryContainer>
          {(formData.isExpense ? expenseCategories : incomeCategories).map((category) => (
            <CategoryChip
              key={category}
              isSelected={formData.category === category}
              onPress={() => handleChange('category', category)}
            >
              <CategoryChipText isSelected={formData.category === category}>
                {category}
              </CategoryChipText>
            </CategoryChip>
          ))}
        </CategoryContainer>
        {errors.category && <ErrorText>{errors.category}</ErrorText>}
        
        <BudgetLabel>Budget</BudgetLabel>
        <BudgetSelector>
          <BudgetSelectorButton 
            onPress={() => {
              // Qui potremmo implementare un selettore di budget
              // Per ora, simuliamo la selezione con un Alert
              Alert.alert(
                'Seleziona un budget',
                'Questa funzionalità sarà implementata in futuro'
              );
            }}
          >
            <BudgetSelectorText>
              {selectedBudget 
                ? selectedBudget.name 
                : 'Seleziona un budget'}
            </BudgetSelectorText>
            <Ionicons 
              name="chevron-down-outline" 
              size={20} 
              color="textSecondary"
            />
          </BudgetSelectorButton>
          {errors.budgetId && <ErrorText>{errors.budgetId}</ErrorText>}
        </BudgetSelector>
        
        <DateSelectorLabel>Data</DateSelectorLabel>
        <DateSelector>
          <DateSelectorButton 
            onPress={() => {
              // Qui potremmo implementare un selettore di data
              // Per ora, utilizziamo la data corrente
              Alert.alert(
                'Seleziona una data',
                'Questa funzionalità sarà implementata in futuro'
              );
            }}
          >
            <DateSelectorText>
              {formData.date.toLocaleDateString('it-IT')}
            </DateSelectorText>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color="textSecondary"
            />
          </DateSelectorButton>
        </DateSelector>
        
        <SubmitButtonContainer>
          <Button
            title="Salva transazione"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSubmit}
          />
        </SubmitButtonContainer>
      </ScrollView>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TypeSelector = styled.View`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

interface TypeButtonProps {
  isSelected: boolean;
  isExpense: boolean;
}

const TypeButton = styled.TouchableOpacity<TypeButtonProps>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : 'transparent'};
`;

interface TypeButtonTextProps {
  isSelected: boolean;
}

const TypeButtonText = styled.Text<TypeButtonTextProps>`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.surface : theme.colors.textSecondary};
`;

const CategoryLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const CategoryContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

interface CategoryChipProps {
  isSelected: boolean;
}

const CategoryChip = styled.TouchableOpacity<CategoryChipProps>`
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : theme.colors.surface};
  padding-vertical: ${({ theme }) => theme.spacing.xs}px;
  padding-horizontal: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  margin-right: ${({ theme }) => theme.spacing.xs}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
  border: 1px solid ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : theme.colors.border};
`;

interface CategoryChipTextProps {
  isSelected: boolean;
}

const CategoryChipText = styled.Text<CategoryChipTextProps>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.surface : theme.colors.text};
`;

const BudgetLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const BudgetSelector = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const BudgetSelectorButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const BudgetSelectorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  color: ${({ theme }) => theme.colors.text};
`;

const DateSelectorLabel = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const DateSelector = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
`;

const DateSelectorButton = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const DateSelectorText = styled.Text`
  font-size: ${({ theme }) => theme.typography.fontSizes.md}px;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorText = styled.Text`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

const SubmitButtonContainer = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;