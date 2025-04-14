import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation';
import { Transaction } from '../../types';

type TransactionItemNavigationProp = StackNavigationProp<RootStackParamList>;

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

// Mappa di associazione tra categorie e icone di Ionicons
const CATEGORY_ICONS: Record<string, string> = {
  // Categorie di Spesa
  'Alimentari': 'restaurant-outline',
  'Grocery': 'restaurant-outline',
  'Cibo': 'restaurant-outline',
  'Food': 'restaurant-outline',
  'Restaurant': 'restaurant-outline',
  'Ristorante': 'restaurant-outline',
  
  'Trasporti': 'car-outline',
  'Transport': 'car-outline',
  'Car': 'car-outline',
  'Auto': 'car-outline',
  'Gasoline': 'flame-outline',
  'Benzina': 'flame-outline',
  'Gasolio': 'flame-outline',
  'Carburante': 'flame-outline',
  
  'Casa': 'home-outline',
  'House': 'home-outline',
  'Rent': 'home-outline',
  'Affitto': 'home-outline',
  'Mutuo': 'home-outline',
  'Mortgage': 'home-outline',
  
  'Svago': 'game-controller-outline',
  'Entertainment': 'game-controller-outline',
  'Games': 'game-controller-outline',
  'Cinema': 'film-outline',
  'Movies': 'film-outline',
  
  'Salute': 'medkit-outline',
  'Health': 'medkit-outline',
  'Medical': 'medkit-outline',
  'Doctor': 'medical-outline',
  'Medico': 'medical-outline',
  'Farmacia': 'fitness-outline',
  'Pharmacy': 'fitness-outline',
  
  'Bollette': 'flash-outline',
  'Utilities': 'flash-outline',
  'Electricity': 'flash-outline',
  'Water': 'water-outline',
  'Gas': 'flame-outline',
  'Internet': 'wifi-outline',
  'Phone': 'call-outline',
  'Telefono': 'call-outline',
  
  'Shopping': 'cart-outline',
  'Clothes': 'shirt-outline',
  'Abbigliamento': 'shirt-outline',
  'Shoes': 'footsteps-outline',
  'Scarpe': 'footsteps-outline',
  
  'Istruzione': 'school-outline',
  'Education': 'school-outline',
  'Books': 'book-outline',
  'Libri': 'book-outline',
  'Corsi': 'school-outline',
  'Courses': 'school-outline',
  
  'Viaggi': 'airplane-outline',
  'Travel': 'airplane-outline',
  'Hotel': 'bed-outline',
  'Vacation': 'umbrella-outline',
  'Vacanza': 'umbrella-outline',
  
  'Altro': 'apps-outline',
  'Other': 'apps-outline',
  'Miscellaneous': 'apps-outline',
  'Varie': 'apps-outline',
  
  // Categorie Entrate
  'Stipendio': 'cash-outline',
  'Salary': 'cash-outline',
  'Income': 'cash-outline',
  'Entrata': 'cash-outline',
  'Paycheck': 'cash-outline',
  'Wages': 'cash-outline',
  
  'Bonus': 'gift-outline',
  'Premio': 'gift-outline',
  'Award': 'trophy-outline',
  
  'Regali': 'gift-outline',
  'Gifts': 'gift-outline',
  'Present': 'gift-outline',
  
  'Investment': 'trending-up-outline',
  'Investimento': 'trending-up-outline',
  'Stocks': 'stats-chart-outline',
  'Azioni': 'stats-chart-outline',
  
  'Rimborso': 'return-down-back-outline',
  'Refund': 'return-down-back-outline',
  'Reimbursement': 'return-down-back-outline',
  
  // Categorie generali o speciali
  'Taxes': 'document-text-outline',
  'Tasse': 'document-text-outline',
  'Tax': 'document-text-outline',
  
  'Bar': 'wine-outline',
  'Pub': 'beer-outline',
  'Drink': 'beer-outline',
  
  'Satispay': 'wallet-outline',
  'PayPal': 'logo-paypal',
  'Credit Card': 'card-outline',
  'Carta di credito': 'card-outline',
  'Carta': 'card-outline',
  'Card': 'card-outline',
  'Special': 'star-outline',
  'Speciale': 'star-outline',
};

// Funzione per ottenere l'icona corretta in base alla categoria
const getCategoryIcon = (transaction: Transaction): string => {
  // Prima controlliamo il nome della categoria se disponibile
  if (transaction.category?.name) {
    const iconName = CATEGORY_ICONS[transaction.category.name];
    if (iconName) {
      return iconName;
    }
    
    // Se non troviamo un'icona diretta, proviamo a cercare parole chiave nel nome della categoria
    for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
      if (transaction.category.name.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
  }
  
  // Se abbiamo un campo description nella transazione, proviamo a cercarlo 
  if (transaction.description) {
    for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
      if (transaction.description.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
  }
  
  // Icone di fallback basate sul tipo di transazione
  if (transaction.type === 'INCOME') {
    return 'cash-outline'; // Default per entrate
  }
  
  // Default per spese
  return 'card-outline';
};

// Formatta la valuta
const formatCurrency = (amount: any): string => {
  const numAmount = Number(amount);
  if (amount === undefined || amount === null || isNaN(numAmount)) {
    return '€0,00';
  }
  
  try {
    return `€${Math.abs(numAmount).toFixed(2)}`.replace('.', ',');
  } catch (error) {
    console.error('Error formatting currency:', error, amount);
    return '€0,00';
  }
};

// Formatta la data
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateStr);
    return '';
  }
};

export const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  onDelete 
}) => {
  const theme = useTheme();
  const navigation = useNavigation<TransactionItemNavigationProp>();

  const amount = transaction.amount || 0;
  const isExpense = transaction.type === 'EXPENSE';
  const iconName = getCategoryIcon(transaction);
  const categoryName = transaction.category?.name || (isExpense ? 'Spesa' : 'Entrata');
  const categoryColor = transaction.category?.color || (isExpense ? theme.colors.error : theme.colors.success);
  
  // Conferma prima di eliminare
  const confirmDelete = (transactionId: string) => {
    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questa transazione?',
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Elimina',
          onPress: () => onDelete && onDelete(transactionId),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.transactionContainer}>
      <TouchableOpacity
        style={[
          styles.transactionCard,
          { backgroundColor: theme.colors.surface },
        ]}
        onPress={() =>
          navigation.navigate('EditTransaction', {
            transactionId: transaction.id,
          })
        }
        onLongPress={() => onDelete && confirmDelete(transaction.id)}
        delayLongPress={500}
      >
        <View style={styles.transactionIcon}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: categoryColor },
            ]}
          >
            <Ionicons
              name={iconName}
              size={20}
              color="white"
            />
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <Text
            style={[
              styles.transactionTitle,
              { color: theme.colors.text },
            ]}
          >
            {transaction.description || 'Transazione'}
          </Text>
          <View style={styles.transactionSubtitle}>
            <Text
              style={[
                styles.transactionCategory,
                { color: theme.colors.textSecondary },
              ]}
            >
              {categoryName}
            </Text>
            {transaction.date && (
              <Text
                style={[
                  styles.transactionDate,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {formatDate(transaction.date)}
              </Text>
            )}
          </View>
        </View>

        <Text
          style={[
            styles.transactionAmount,
            {
              color: isExpense
                ? theme.colors.error
                : theme.colors.success,
            },
          ]}
        >
          {isExpense ? '-' : '+'}
          {formatCurrency(amount)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCategory: {
    fontSize: 14,
  },
  transactionDate: {
    fontSize: 12,
    marginLeft: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TransactionItem;