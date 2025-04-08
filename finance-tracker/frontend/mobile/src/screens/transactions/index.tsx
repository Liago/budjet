import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SwipeListView } from "react-native-swipe-list-view";

import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchTransactions,
  deleteTransaction,
  setFilters,
} from "../../store/slices/transactionSlice";
import {
  fetchCategories,
  fetchCategoriesByType,
} from "../../store/slices/categorySlice";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { Button } from "../../components/common/button";
import { RootStackParamList } from "../../navigation";
import { Category, Transaction, TransactionFilters } from "../../types";

type TransactionsScreenRouteProp = RouteProp<
  RootStackParamList,
  "TransactionsList"
>;

type TransactionsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "TransactionsList"
>;

// Icone sicure per Ionicons
const safeIcons = {
  default: "card-outline",
  food: "restaurant-outline",
  transport: "car-outline",
  shopping: "cart-outline",
  health: "medkit-outline",
  entertainment: "game-controller-outline",
  house: "home-outline",
  utilities: "flash-outline",
  education: "school-outline",
  travel: "airplane-outline",
  salary: "cash-outline",
  gifts: "gift-outline",
} as const;

// Funzione per ottenere un'icona sicura
const getSafeIcon = (iconName?: string): keyof typeof safeIcons => {
  if (!iconName) return "default";
  return safeIcons[iconName as keyof typeof safeIcons]
    ? (iconName as keyof typeof safeIcons)
    : "default";
};

export default function TransactionsScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<TransactionsScreenNavigationProp>();
  const route = useRoute<TransactionsScreenRouteProp>();

  // Stato per i filtri
  const [showFilters, setShowFilters] = useState(
    route.params?.showFilters || false
  );
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"INCOME" | "EXPENSE" | null>(
    null
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Ottenere i dati dalle transazioni
  const { transactions, isLoading, filters, pagination } = useAppSelector(
    (state) => state.transaction
  );
  const { categories } = useAppSelector((state) => state.category);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  // Array di mesi per il filtro
  const months = [
    { label: "Gennaio", value: "01" },
    { label: "Febbraio", value: "02" },
    { label: "Marzo", value: "03" },
    { label: "Aprile", value: "04" },
    { label: "Maggio", value: "05" },
    { label: "Giugno", value: "06" },
    { label: "Luglio", value: "07" },
    { label: "Agosto", value: "08" },
    { label: "Settembre", value: "09" },
    { label: "Ottobre", value: "10" },
    { label: "Novembre", value: "11" },
    { label: "Dicembre", value: "12" },
  ];

  // Carica le transazioni e le categorie
  const loadData = async () => {
    try {
      // Aggiungiamo i filtri senza includere la ricerca testo
      const currentFilters: TransactionFilters = {
        ...filters,
        // Non includiamo search perché non è supportato dal backend
        limit: 100, // Carica più transazioni per evitare frequenti richieste
      };

      // Aggiungiamo il filtro per mese se selezionato
      if (selectedMonth) {
        const currentYear = new Date().getFullYear();
        currentFilters.startDate = `${currentYear}-${selectedMonth}-01`;

        // Ultimo giorno del mese
        const lastDay = new Date(
          currentYear,
          parseInt(selectedMonth),
          0
        ).getDate();
        currentFilters.endDate = `${currentYear}-${selectedMonth}-${lastDay}`;
      }

      // Aggiungiamo il filtro per tipo se selezionato
      if (selectedType) {
        currentFilters.type = selectedType;
      }

      // Aggiungiamo il filtro per categorie se selezionate
      if (selectedCategoryIds.length > 0) {
        currentFilters.categoryId = selectedCategoryIds[0];
      }

      await dispatch(fetchTransactions(currentFilters));
      await dispatch(fetchCategories());
    } catch (error) {
      console.error("Errore nel caricamento delle transazioni:", error);
    }
  };

  // Carica i dati all'avvio
  useEffect(() => {
    loadData();
  }, [dispatch, selectedMonth, selectedType, selectedCategoryIds]);

  // Applica il filtro di ricerca lato client quando searchText o transactions cambiano
  useEffect(() => {
    if (!searchText || searchText.trim() === "") {
      setFilteredTransactions(transactions);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = transactions.filter((transaction) => {
      // Cerca nella descrizione
      if (
        transaction.description &&
        transaction.description.toLowerCase().includes(searchLower)
      ) {
        return true;
      }

      // Cerca nella categoria
      if (
        transaction.category &&
        transaction.category.name &&
        transaction.category.name.toLowerCase().includes(searchLower)
      ) {
        return true;
      }

      // Cerca nei tag (se esistono)
      if (transaction.tags && transaction.tags.length > 0) {
        // In alcuni casi tags può essere un array di stringhe o un array di oggetti con proprietà 'name'
        return transaction.tags.some((tag) => {
          if (typeof tag === "string") {
            return tag.toLowerCase().includes(searchLower);
          } else if (typeof tag === "object" && tag !== null && "name" in tag) {
            return tag.name.toLowerCase().includes(searchLower);
          }
          return false;
        });
      }

      return false;
    });

    setFilteredTransactions(filtered);
  }, [searchText, transactions]);

  // Gestisce il refresh pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Funzione per formattare la valuta
  const formatCurrency = (amount: any): string => {
    // Converti esplicitamente a number se possibile
    const numAmount = Number(amount);

    // Verifica se è un numero valido
    if (amount === undefined || amount === null || isNaN(numAmount)) {
      return "€0,00";
    }

    try {
      return `€${numAmount.toFixed(2)}`.replace(".", ",");
    } catch (error) {
      console.error("Error formatting currency:", error, amount);
      return "€0,00";
    }
  };

  // Calcola i totali delle transazioni
  const calculateTotals = () => {
    const totals = {
      income: 0,
      expense: 0,
      balance: 0,
    };

    // Usa filteredTransactions invece di transactions
    filteredTransactions.forEach((transaction) => {
      if (transaction.type === "INCOME") {
        totals.income += Number(transaction.amount);
      } else {
        totals.expense += Number(transaction.amount);
      }
    });

    totals.balance = totals.income - totals.expense;
    return totals;
  };

  const transactionTotals = calculateTotals();

  // Componente per visualizzare i totali
  const renderTransactionTotals = () => {
    return (
      <View
        style={[
          styles.totalsContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text
          style={[
            styles.transactionsCount,
            { color: theme.colors.textSecondary },
          ]}
        >
          Mostrando {filteredTransactions.length} transazioni
        </Text>
        <View style={styles.totalsSummary}>
          <Text style={[styles.totalIncome, { color: theme.colors.success }]}>
            Entrate: {formatCurrency(transactionTotals.income)}
          </Text>
          <Text style={[styles.totalExpense, { color: theme.colors.error }]}>
            Uscite: {formatCurrency(transactionTotals.expense)}
          </Text>
          <Text
            style={[
              styles.totalBalance,
              {
                color:
                  transactionTotals.balance >= 0
                    ? theme.colors.primary
                    : theme.colors.error,
              },
            ]}
          >
            Bilancio: {formatCurrency(transactionTotals.balance)}
          </Text>
        </View>
      </View>
    );
  };

  // Formatta la data
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";

    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      console.error("Errore nella formattazione della data:", error);
      return "";
    }
  };

  // Gestisce l'eliminazione di una transazione
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await dispatch(deleteTransaction(transactionId)).unwrap();
      Alert.alert("Successo", "Transazione eliminata con successo");
      onRefresh();
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
      Alert.alert("Errore", "Impossibile eliminare la transazione");
    }
  };

  // Chiede conferma prima di eliminare
  const confirmDelete = (transactionId: string) => {
    Alert.alert(
      "Conferma eliminazione",
      "Sei sicuro di voler eliminare questa transazione?",
      [
        {
          text: "Annulla",
          style: "cancel",
        },
        {
          text: "Elimina",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(deleteTransaction(transactionId)).unwrap();
              // Ricarica le transazioni dopo l'eliminazione
              loadData();
            } catch (error) {
              console.error("Errore durante l'eliminazione:", error);
              Alert.alert("Errore", "Impossibile eliminare la transazione");
            }
          },
        },
      ]
    );
  };

  // Gestisce la selezione/deselezione di una categoria nel filtro
  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategoryIds((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  // Resetta tutti i filtri
  const resetFilters = () => {
    setSearchText("");
    setSelectedMonth(null);
    setSelectedType(null);
    setSelectedCategoryIds([]);
    setFilterModalVisible(false);
  };

  // Applica i filtri e chiude il modale
  const applyFilters = () => {
    // Se è selezionato un tipo, carica le categorie per quel tipo
    if (selectedType) {
      dispatch(fetchCategoriesByType(selectedType));
    } else {
      // Altrimenti carica tutte le categorie
      dispatch(fetchCategories());
    }

    setFilterModalVisible(false);
    loadData();
  };

  // Renderizza l'elemento della transazione
  const renderTransactionItem = (data: { item: Transaction }) => {
    const transaction = data.item;
    const amount = transaction.amount || 0;
    const isExpense = transaction.type === "EXPENSE";
    const iconName = transaction.category?.icon
      ? getSafeIcon(transaction.category.icon)
      : "default";

    return (
      <TouchableOpacity
        style={[
          styles.transactionCard,
          { backgroundColor: theme.colors.surface },
        ]}
        onPress={() =>
          navigation.navigate("EditTransaction", {
            transactionId: transaction.id,
          })
        }
        onLongPress={() => confirmDelete(transaction.id)}
        delayLongPress={500}
      >
        <View style={styles.transactionIcon}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  transaction.category?.color || theme.colors.secondary,
              },
            ]}
          >
            <Ionicons name={safeIcons[iconName]} size={20} color="white" />
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
            {transaction.description || "Transazione"}
          </Text>
          <View style={styles.transactionSubtitle}>
            <Text
              style={[
                styles.transactionCategory,
                { color: theme.colors.textSecondary },
              ]}
            >
              {transaction.category?.name || "Non categorizzato"}
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
              color: isExpense ? theme.colors.error : theme.colors.success,
            },
          ]}
        >
          {isExpense ? "-" : "+"}
          {formatCurrency(transaction.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  // Renderizza l'elemento nascosto per lo swipe
  const renderHiddenItem = (data: { item: Transaction }) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
        onPress={() => confirmDelete(data.item.id)}
      >
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  // Renderizza il modale dei filtri
  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <View
        style={[
          styles.modalContent,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Filtri
          </Text>
          <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Filtro per mese */}
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
          Mese
        </Text>
        <View style={styles.monthsContainer}>
          {months.map((month) => (
            <TouchableOpacity
              key={month.value}
              style={[
                styles.monthItem,
                selectedMonth === month.value && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() =>
                setSelectedMonth(
                  selectedMonth === month.value ? null : month.value
                )
              }
            >
              <Text
                style={[
                  styles.monthText,
                  {
                    color:
                      selectedMonth === month.value
                        ? "white"
                        : theme.colors.text,
                  },
                ]}
              >
                {month.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Filtro per tipo */}
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
          Tipo
        </Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === "EXPENSE" && {
                backgroundColor: theme.colors.error,
              },
            ]}
            onPress={() =>
              setSelectedType(selectedType === "EXPENSE" ? null : "EXPENSE")
            }
          >
            <Text
              style={{
                color: selectedType === "EXPENSE" ? "white" : theme.colors.text,
              }}
            >
              Spese
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === "INCOME" && {
                backgroundColor: theme.colors.success,
              },
            ]}
            onPress={() =>
              setSelectedType(selectedType === "INCOME" ? null : "INCOME")
            }
          >
            <Text
              style={{
                color: selectedType === "INCOME" ? "white" : theme.colors.text,
              }}
            >
              Entrate
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro per categoria */}
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
          Categorie
        </Text>
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategoryIds.includes(category.id) && {
                  backgroundColor: theme.colors.primary + "30", // 30% opacità
                },
              ]}
              onPress={() => toggleCategorySelection(category.id)}
            >
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: category.color },
                ]}
              />
              <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                {category.name}
              </Text>
              {selectedCategoryIds.includes(category.id) && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Pulsanti di azione */}
        <View style={styles.actionButtons}>
          <Button
            title="Reset"
            variant="outline"
            onPress={resetFilters}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Applica"
            onPress={applyFilters}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </View>
    </Modal>
  );

  // Mostra il caricamento se non c'è refresh e sta caricando
  if (isLoading && !refreshing && filteredTransactions.length === 0) {
    return <LoadingScreen message="Caricamento transazioni..." />;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Barra di ricerca e filtri */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Cerca transazioni..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Indicatore di filtri attivi */}
      {(searchText ||
        selectedMonth ||
        selectedType ||
        selectedCategoryIds.length > 0) && (
        <View style={styles.activeFiltersContainer}>
          <Text
            style={[
              styles.activeFiltersText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Filtri attivi:
            {searchText ? " Ricerca" : ""}
            {selectedMonth
              ? ` Mese: ${
                  months.find((m) => m.value === selectedMonth)?.label ||
                  selectedMonth
                }`
              : ""}
            {selectedType
              ? ` Tipo: ${selectedType === "INCOME" ? "Entrate" : "Uscite"}`
              : ""}
            {selectedCategoryIds.length > 0
              ? ` Categorie: ${categories
                  .filter((cat) => selectedCategoryIds.includes(cat.id))
                  .map((cat) => cat.name)
                  .join(", ")}`
              : ""}
          </Text>
          <TouchableOpacity onPress={resetFilters}>
            <Text style={{ color: theme.colors.primary }}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista delle transazioni */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text
            style={[
              styles.emptyStateText,
              { color: theme.colors.textSecondary },
            ]}
          >
            Nessuna transazione trovata
          </Text>
        </View>
      ) : (
        <>
          <SwipeListView
            data={filteredTransactions}
            renderItem={renderTransactionItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-75}
            disableRightSwipe
            keyExtractor={(item) => `transaction-${item.id}`}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />
          {renderTransactionTotals()}
        </>
      )}

      {/* Modale dei filtri */}
      {renderFilterModal()}

      {/* FAB per aggiungere una nuova transazione */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("AddTransaction")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 22,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activeFiltersText: {
    fontSize: 12,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionSubtitle: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "transparent",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 15,
    marginBottom: 8,
    borderRadius: 12,
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: "100%",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "80%",
    maxHeight: 600,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 8,
  },
  monthsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  monthItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    margin: 4,
  },
  monthText: {
    fontSize: 14,
  },
  typeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#eee",
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Stili per i totali
  totalsContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 80, // Spazio per il FAB
  },
  transactionsCount: {
    fontSize: 12,
    marginBottom: 4,
  },
  totalsSummary: {
    flexDirection: "column",
    gap: 4,
  },
  totalIncome: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalExpense: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalBalance: {
    fontSize: 14,
    fontWeight: "700",
  },
});
