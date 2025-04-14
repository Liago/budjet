import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchTransactions,
  deleteTransaction,
} from "../../store/slices/transactionSlice";
import { TransactionItem } from "../../components/transaction-item";
import { Transaction, Category } from "../../types";
import { RootStackParamList } from "../../navigation";
import { categoryService } from "../../api/services";

type TransactionsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface DayGroup {
  date: string;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
  dailyBalance: number;
}

// Mappa di associazione tra categorie e icone di Ionicons
const CATEGORY_ICONS: Record<string, string> = {
  // Categorie di Spesa
  Alimentari: "restaurant-outline",
  Grocery: "basket-outline",
  Cibo: "restaurant-outline",
  Food: "restaurant-outline",
  Restaurant: "restaurant-outline",
  Ristorante: "restaurant-outline",

  Trasporti: "car-outline",
  Transport: "car-outline",
  Car: "car-outline",
  Auto: "car-outline",
  Gasoline: "flame-outline",
  Benzina: "flame-outline",
  Gasolio: "flame-outline",
  Carburante: "flame-outline",

  Casa: "home-outline",
  House: "home-outline",
  Home: "home-outline",
  Rent: "home-outline",
  Affitto: "home-outline",
  Mutuo: "home-outline",
  Mortgage: "home-outline",

  Svago: "game-controller-outline",
  Entertainment: "game-controller-outline",
  Games: "game-controller-outline",
  Cinema: "film-outline",
  Movies: "film-outline",

  Salute: "medkit-outline",
  Health: "medkit-outline",
  Medical: "medical-outline",
  Doctor: "medical-outline",
  Medico: "medical-outline",
  Farmacia: "fitness-outline",
  Pharmacy: "fitness-outline",

  Bollette: "flash-outline",
  Utilities: "flash-outline",
  Electricity: "flash-outline",
  Water: "water-outline",
  Gas: "flame-outline",
  Internet: "wifi-outline",
  Phone: "call-outline",
  Telefono: "call-outline",

  Shopping: "bag-handle-outline",
  Clothes: "shirt-outline",
  Abbigliamento: "shirt-outline",
  Shoes: "footsteps-outline",
  Scarpe: "footsteps-outline",

  Istruzione: "school-outline",
  Education: "school-outline",
  Books: "book-outline",
  Libri: "book-outline",
  Corsi: "school-outline",
  Courses: "school-outline",

  Viaggi: "airplane-outline",
  Travel: "airplane-outline",
  Hotel: "bed-outline",
  Vacation: "umbrella-outline",
  Vacanza: "umbrella-outline",

  Pets: "paw-outline",
  Animali: "paw-outline",
  Pet: "paw-outline",

  Altro: "apps-outline",
  Other: "apps-outline",
  Miscellaneous: "apps-outline",
  Varie: "apps-outline",

  // Categorie Entrate
  Stipendio: "cash-outline",
  Salary: "cash-outline",
  Income: "cash-outline",
  Entrata: "cash-outline",
  Paycheck: "cash-outline",
  Wages: "cash-outline",

  Bonus: "gift-outline",
  Premio: "gift-outline",
  Award: "trophy-outline",

  Regali: "gift-outline",
  Gifts: "gift-outline",
  Present: "gift-outline",

  Investment: "trending-up-outline",
  Investimento: "trending-up-outline",
  Stocks: "stats-chart-outline",
  Azioni: "stats-chart-outline",

  Rimborso: "return-down-back-outline",
  Refund: "return-down-back-outline",
  Reimbursement: "return-down-back-outline",

  // Categorie generali o speciali
  Taxes: "document-text-outline",
  Tasse: "document-text-outline",
  Tax: "document-text-outline",

  Bar: "wine-outline",
  Pub: "beer-outline",
  Drink: "beer-outline",

  Satispay: "wallet-outline",
  PayPal: "logo-paypal",
  "Credit Card": "card-outline",
  "Carta di credito": "card-outline",
  Carta: "card-outline",
  Card: "card-outline",
  Special: "star-outline",
  Speciale: "star-outline",

  // La categoria "Tutte le categorie" per il filtro
  "Tutte le categorie": "grid-outline",
  "All categories": "grid-outline",
};

const TransactionsScreen = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<TransactionsScreenNavigationProp>();
  const initialLoadDone = useRef(false);
  const [showFilters, setShowFilters] = useState(false);

  // Accesso sicuro allo stato con selettori memoizzati per prevenire re-render inutili
  const transactions = useAppSelector(
    (state) => state.transaction?.transactions || []
  );
  const isLoading = useAppSelector(
    (state) => state.transaction?.isLoading || false
  );
  const paginationFromState = useAppSelector(
    (state) =>
      state.transaction?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      }
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [groupedTransactions, setGroupedTransactions] = useState<DayGroup[]>(
    []
  );

  // Stati per i filtri
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"INCOME" | "EXPENSE" | "">(
    ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] =
    useState<boolean>(false);

  // Riferimento per lo scroll view dei mesi
  const monthsScrollViewRef = useRef<ScrollView>(null);
  const filterScrollViewRef = useRef<ScrollView>(null);

  // Opzioni per i filtri
  const months = useMemo(
    () => [
      { label: "Tutti i mesi", value: "" },
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
    ],
    []
  );

  const types = useMemo(
    () => [
      { label: "Tutti i tipi", value: "" },
      { label: "Entrate", value: "INCOME" },
      { label: "Uscite", value: "EXPENSE" },
    ],
    []
  );

  // Carica le categorie dal backend
  const loadCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const categories = await categoryService.getAll();
      console.log("Categorie caricate:", categories);
      setCategoryList(categories);
    } catch (error) {
      console.error("Errore nel caricamento delle categorie:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  // Carica le categorie quando si apre il filtro
  useEffect(() => {
    if (showFilters && categoryList.length === 0 && !isLoadingCategories) {
      loadCategories();
    }
  }, [showFilters, loadCategories, categoryList, isLoadingCategories]);

  // Scorre automaticamente al mese selezionato quando viene aperta la modal
  useEffect(() => {
    if (showFilters && selectedMonth) {
      setTimeout(() => {
        // Trova l'indice del mese selezionato
        const selectedIndex = months.findIndex(
          (m) => m.value === selectedMonth
        );
        if (selectedIndex !== -1 && monthsScrollViewRef.current) {
          // Calcola la posizione di scroll (approssimativa)
          const position = selectedIndex * 100; // Approssimazione della larghezza di un elemento chip
          monthsScrollViewRef.current.scrollTo({ x: position, animated: true });
        }
      }, 300); // Piccolo delay per far sì che la modal sia completamente visibile
    }
  }, [showFilters, selectedMonth, months]);

  // Raggruppa le transazioni per data - memoizzato una volta per tutte
  const groupTransactionsByDate = useCallback(
    (transactionList: Transaction[]) => {
      const groups: Record<string, Transaction[]> = {};

      transactionList.forEach((transaction) => {
        if (!transaction.date) return;

        const date = transaction.date.split("T")[0]; // YYYY-MM-DD
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(transaction);
      });

      const result: DayGroup[] = Object.entries(groups).map(
        ([date, dayTransactions]) => {
          let totalIncome = 0;
          let totalExpense = 0;

          dayTransactions.forEach((t) => {
            if (t.type === "INCOME") {
              totalIncome += Number(t.amount) || 0;
            } else {
              totalExpense += Number(t.amount) || 0;
            }
          });

          return {
            date,
            transactions: dayTransactions,
            totalIncome,
            totalExpense,
            dailyBalance: totalIncome - totalExpense,
          };
        }
      );

      return result.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    []
  );

  // Carica le transazioni - evitando loop infiniti
  const loadTransactions = useCallback(
    async (newPage = 1, search = "") => {
      if (isLoading) return; // Previene chiamate multiple se è già in caricamento

      try {
        const filters = {
          search: search || undefined,
          page: newPage,
          limit: 10,
          sortBy: "date",
          sortDirection: "desc" as "desc",
          month: selectedMonth || undefined,
          type: selectedType || undefined,
          categoryId: selectedCategory || undefined,
        };

        await dispatch(fetchTransactions(filters));
      } catch (error: any) {
        console.error(
          "Errore durante il caricamento delle transazioni:",
          error
        );

        // Reset state in case of error
        setRefreshing(false);
        setLoadingMore(false);

        // Allow API service to handle 401 errors globally
        // The API interceptor will handle redirection to login
        if (error.response?.status !== 401) {
          // For other errors, show a message to the user
          alert("Errore nel caricamento delle transazioni. Riprova più tardi.");
        }
      }
    },
    [
      dispatch,
      isLoading,
      selectedMonth,
      selectedType,
      selectedCategory,
      navigation,
    ]
  );

  // Carica i dati iniziali - una sola volta al montaggio
  useEffect(() => {
    if (!initialLoadDone.current) {
      loadTransactions(1, searchQuery);
      initialLoadDone.current = true;
    }
  }, []);

  // Aggiorna i gruppi quando le transazioni cambiano
  useEffect(() => {
    if (transactions?.length > 0) {
      const grouped = groupTransactionsByDate(transactions);
      setGroupedTransactions(grouped);
    } else {
      setGroupedTransactions([]);
    }
  }, [transactions, groupTransactionsByDate]);

  // Gestisce l'aggiornamento
  const onRefresh = useCallback(async () => {
    if (isLoading) return; // Evita chiamate multiple durante il caricamento

    setRefreshing(true);
    setPage(1);
    await loadTransactions(1, searchQuery);
    setRefreshing(false);
  }, [loadTransactions, searchQuery, isLoading]);

  // Gestisce la ricerca
  const handleSearch = useCallback(() => {
    if (isLoading) return; // Evita chiamate multiple durante il caricamento

    setPage(1);
    loadTransactions(1, searchQuery);
  }, [loadTransactions, searchQuery, isLoading]);

  // Elimina una transazione
  const handleDeleteTransaction = useCallback(
    async (transactionId: string) => {
      if (isLoading) return; // Evita chiamate multiple durante il caricamento

      try {
        await dispatch(deleteTransaction(transactionId));
        // Ricarica le transazioni per aggiornare la vista
        setPage(1);
        loadTransactions(1, searchQuery);
      } catch (error) {
        console.error(
          "Errore durante l'eliminazione della transazione:",
          error
        );
      }
    },
    [dispatch, loadTransactions, searchQuery, isLoading]
  );

  // Formatta la data per il titolo del gruppo
  const formatGroupDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  // Formatta l'importo in valuta
  const formatCurrency = useCallback((amount: number) => {
    return `€${Math.abs(amount).toFixed(2)}`.replace(".", ",");
  }, []);

  // Calcola il riepilogo - memoizzato per evitare calcoli inutili
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction: Transaction) => {
      if (transaction.type === "INCOME") {
        totalIncome += Number(transaction.amount) || 0;
      } else {
        totalExpense += Number(transaction.amount) || 0;
      }
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [transactions]);

  // Carica più transazioni
  const handleLoadMore = useCallback(() => {
    if (loadingMore || isLoading) return;
    const currentPagination = paginationFromState;

    if (currentPagination && page < currentPagination.totalPages) {
      setLoadingMore(true);
      const nextPage = page + 1;
      loadTransactions(nextPage, searchQuery).finally(() => {
        setPage(nextPage);
        setLoadingMore(false);
      });
    }
  }, [
    loadingMore,
    isLoading,
    paginationFromState,
    page,
    loadTransactions,
    searchQuery,
  ]);

  // Gestisce l'applicazione dei filtri
  const applyFilters = useCallback(() => {
    setPage(1);
    loadTransactions(1, searchQuery);
    setShowFilters(false);
  }, [loadTransactions, searchQuery]);

  // Resetta i filtri
  const resetFilters = useCallback(() => {
    setSelectedMonth("");
    setSelectedType("");
    setSelectedCategory("");
    setPage(1);
    loadTransactions(1, searchQuery);
    setShowFilters(false);
  }, [loadTransactions, searchQuery]);

  // Renderizza un gruppo di transazioni
  const renderItem = useCallback(
    ({ item }: { item: DayGroup }) => {
      return (
        <View
          style={[
            styles.groupContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View
            style={[
              styles.groupHeader,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Text style={[styles.groupDate, { color: theme.colors.text }]}>
              {formatGroupDate(item.date)}
            </Text>
            <View style={styles.groupSummary}>
              <Text
                style={[
                  styles.groupBalance,
                  {
                    color:
                      item.dailyBalance >= 0
                        ? theme.colors.success
                        : theme.colors.error,
                  },
                ]}
              >
                {item.dailyBalance >= 0 ? "+" : "-"}
                {formatCurrency(Math.abs(item.dailyBalance))}
              </Text>
            </View>
          </View>

          {item.transactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onDelete={handleDeleteTransaction}
            />
          ))}
        </View>
      );
    },
    [formatGroupDate, formatCurrency, theme.colors, handleDeleteTransaction]
  );

  // Renderizza il sommario
  const renderSummary = () => {
    if (transactions.length === 0) return null;

    return (
      <View
        style={[
          styles.summaryContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text style={styles.summaryTitle}>
          Mostrando {transactions.length} transazioni
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.success }]}>
            Entrate:{" "}
            <Text style={styles.summaryAmount}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.error }]}>
            Uscite:{" "}
            <Text style={styles.summaryAmount}>
              {formatCurrency(summary.totalExpense)}
            </Text>
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text
            style={[
              styles.summaryLabel,
              {
                color:
                  summary.balance >= 0
                    ? theme.colors.success
                    : theme.colors.error,
              },
            ]}
          >
            Bilancio:{" "}
            <Text style={styles.summaryAmount}>
              {summary.balance >= 0 ? "€" : "€-"}
              {formatCurrency(Math.abs(summary.balance))}
            </Text>
          </Text>
        </View>
      </View>
    );
  };

  // Renderizza i chip delle categorie dinamicamente dalle categorie caricate dal backend
  const renderCategoryChips = useCallback(() => {
    if (isLoadingCategories) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }

    if (categoryList.length === 0) {
      return (
        <Text
          style={{
            color: theme.colors.textSecondary,
            textAlign: "center",
            padding: 16,
          }}
        >
          Nessuna categoria disponibile
        </Text>
      );
    }

    const allCategoriesOption = {
      id: "",
      name: "Tutte le categorie",
      type: "",
      color: theme.colors.primary,
    };

    const categoriesWithAll = [allCategoriesOption, ...categoryList];

    return (
      <View style={styles.categoriesGrid}>
        {categoriesWithAll.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id
                ? { backgroundColor: theme.colors.primary }
                : {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  },
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons
              name={getCategoryIcon(category.name)}
              size={18}
              color={
                selectedCategory === category.id ? "#fff" : theme.colors.text
              }
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color:
                    selectedCategory === category.id
                      ? "#fff"
                      : theme.colors.text,
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [categoryList, selectedCategory, isLoadingCategories, theme]);

  // Helper per ottenere l'icona appropriata per ogni categoria
  const getCategoryIcon = useCallback((categoryName: string): any => {
    if (!categoryName) return "grid-outline";

    // Cerca prima per corrispondenza esatta (case insensitive)
    for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
      if (key.toLowerCase() === categoryName.toLowerCase()) {
        return value;
      }
    }

    // Se non troviamo una corrispondenza esatta, cerchiamo corrispondenze parziali
    for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Log per debugging
    console.log("Categoria non riconosciuta:", categoryName);

    // Icona di fallback per default
    return "ellipsis-horizontal-outline";
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Barra di ricerca */}
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
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Cerca transazioni..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modale dei filtri */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Filtri
              </Text>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity
                  onPress={resetFilters}
                  style={styles.resetButton}
                >
                  <Text
                    style={[
                      styles.resetButtonText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.filtersScrollView}
              ref={filterScrollViewRef}
            >
              {/* Filtro per mese */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  MESE
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipScroll}
                  contentContainerStyle={styles.chipScrollContent}
                  ref={monthsScrollViewRef}
                >
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.optionChip,
                        selectedMonth === month.value
                          ? { backgroundColor: theme.colors.primary }
                          : {
                              backgroundColor: theme.colors.background,
                              borderColor: theme.colors.border,
                              borderWidth: 1,
                            },
                      ]}
                      onPress={() => setSelectedMonth(month.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              selectedMonth === month.value
                                ? "#fff"
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Filtro per tipo */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  TIPO
                </Text>
                <View style={styles.typeButtons}>
                  {types.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeButton,
                        selectedType === type.value
                          ? { backgroundColor: theme.colors.primary }
                          : {
                              backgroundColor: theme.colors.background,
                              borderColor: theme.colors.border,
                              borderWidth: 1,
                            },
                      ]}
                      onPress={() =>
                        setSelectedType(type.value as "INCOME" | "EXPENSE" | "")
                      }
                    >
                      {type.value === "INCOME" && (
                        <Ionicons
                          name="arrow-up-circle-outline"
                          size={18}
                          color={
                            selectedType === type.value ? "#fff" : "#28a745"
                          }
                          style={styles.typeIcon}
                        />
                      )}
                      {type.value === "EXPENSE" && (
                        <Ionicons
                          name="arrow-down-circle-outline"
                          size={18}
                          color={
                            selectedType === type.value ? "#fff" : "#dc3545"
                          }
                          style={styles.typeIcon}
                        />
                      )}
                      {type.value === "" && (
                        <Ionicons
                          name="apps-outline"
                          size={18}
                          color={
                            selectedType === type.value
                              ? "#fff"
                              : theme.colors.text
                          }
                          style={styles.typeIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.typeText,
                          {
                            color:
                              selectedType === type.value
                                ? "#fff"
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filtro per categoria - dinamico dalle categorie del backend */}
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { color: theme.colors.text },
                  ]}
                >
                  CATEGORIA
                </Text>
                {renderCategoryChips()}
              </View>
            </ScrollView>

            <View
              style={[
                styles.modalFooter,
                { borderTopColor: theme.colors.border },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  styles.cancelButton,
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Annulla
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.footerButton,
                  styles.applyButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                onPress={applyFilters}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  Applica
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lista delle transazioni raggruppate per data */}
      <FlatList
        data={groupedTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.date}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Nessuna transazione trovata
              </Text>
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          isLoading && !refreshing && groupedTransactions.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : null
        }
        ListFooterComponentStyle={styles.footerContainer}
      />

      {/* Riepilogo delle transazioni */}
      {renderSummary()}

      {/* Pulsante per aggiungere una nuova transazione */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("AddTransaction", {})}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
  },
  groupContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  groupHeader: {
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  groupDate: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  groupSummary: {
    marginTop: 4,
  },
  groupBalance: {
    fontSize: 14,
    fontWeight: "500",
  },
  separator: {
    height: 8,
  },
  footerLoader: {
    padding: 16,
    alignItems: "center",
  },
  footerContainer: {
    paddingBottom: 72, // Spazio per il pulsante di aggiunta
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryAmount: {
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "90%", // Aumentato per mostrare più contenuto
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  filtersContent: {
    flex: 1,
  },
  filtersScrollView: {
    maxHeight: 400, // Altezza fissa per assicurarsi che sia visibile
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 1,
  },
  chipScroll: {
    paddingBottom: 8,
  },
  chipScrollContent: {
    paddingRight: 16,
  },
  optionChip: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  typeButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  typeIcon: {
    marginRight: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "46%",
    margin: "2%",
    paddingVertical: 12,
    borderRadius: 12,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    borderWidth: 1,
  },
  applyButton: {
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalHeaderButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  resetButton: {
    marginRight: 16,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default TransactionsScreen;
