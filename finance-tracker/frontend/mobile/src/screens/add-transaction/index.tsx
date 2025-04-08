import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "styled-components/native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

import { useAppDispatch, useAppSelector } from "../../store";
import {
  createTransaction,
  updateTransaction,
  fetchTransactionById,
} from "../../store/slices/transactionSlice";
import {
  fetchCategories,
  createCategory,
  fetchCategoriesByType,
} from "../../store/slices/categorySlice";
import { Input } from "../../components/common/input";
import { Button } from "../../components/common/button";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { RootStackParamList } from "../../navigation";
import { fetchDefaultCategoriesByType } from "../../utils/defaultCategories";

type AddTransactionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddTransaction" | "EditTransaction"
>;

type AddTransactionScreenRouteProp = RouteProp<
  RootStackParamList,
  "AddTransaction" | "EditTransaction"
>;

export default function AddTransactionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  const route = useRoute<AddTransactionScreenRouteProp>();
  const dispatch = useAppDispatch();

  // Determina se siamo in modalità modifica - NON usare route.name direttamente in hooks condizionali
  const isEditMode = route.name === "EditTransaction";
  const transactionId = isEditMode ? route.params?.transactionId : null;

  const {
    transactions,
    selectedTransaction,
    isLoading: isTransactionLoading,
    error: transactionError,
  } = useAppSelector((state) => state.transaction);
  const { categories, isLoading: isCategoriesLoading } = useAppSelector(
    (state) => state.category
  );

  // Definiamo tutti gli stati all'inizio
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form validation errors
  const [descriptionError, setDescriptionError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Carica tutte le categorie all'inizio - useEffect sempre eseguito
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Carica prima le categorie generali
        console.log("Caricamento categorie iniziale...");
        await dispatch(fetchCategories()).unwrap();

        // Poi carica le categorie specifiche per il tipo corrente
        console.log("Caricamento categorie per tipo:", type);
        await dispatch(fetchCategoriesByType(type)).unwrap();

        // Se siamo in modalità modifica, carica la transazione
        if (isEditMode && transactionId) {
          console.log("Caricamento transazione con ID:", transactionId);
          await dispatch(fetchTransactionById(transactionId)).unwrap();
        }
      } catch (error) {
        console.error("Errore durante il caricamento iniziale:", error);
        Alert.alert(
          "Errore",
          "Impossibile caricare i dati necessari. Riprova più tardi."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch, isEditMode, transactionId, type]);

  // Aggiorna il form quando la transazione viene caricata - sempre chiamato
  useEffect(() => {
    if (isEditMode && selectedTransaction) {
      setDescription(selectedTransaction.description || "");
      setAmount(
        selectedTransaction.amount ? selectedTransaction.amount.toString() : ""
      );
      setDate(
        selectedTransaction.date
          ? new Date(selectedTransaction.date)
          : new Date()
      );
      setType(selectedTransaction.type || "EXPENSE");
      setSelectedCategoryId(selectedTransaction.categoryId || null);
    }
  }, [isEditMode, selectedTransaction]);

  // Log per le categorie caricate - sempre chiamato
  useEffect(() => {
    console.log("Categorie caricate totali:", categories.length);

    const relevantCategories = categories.filter(
      (category) => category.type === type
    );
    console.log(`Categorie di tipo ${type}:`, relevantCategories.length);

    // Verifica se ci sono categorie solo quando abbiamo finito di caricare
    // e solo se non ci sono categorie per il tipo specifico
    // E SOLO SE NON SIAMO IN MODALITÀ MODIFICA CON UNA CATEGORIA GIÀ SELEZIONATA
    if (
      !isCategoriesLoading &&
      !isLoading &&
      relevantCategories.length === 0 &&
      !(isEditMode && selectedCategoryId)
    ) {
      console.log(
        `Nessuna categoria di tipo ${type} trovata, offrendo di creare predefinite`
      );
      Alert.alert(
        "Nessuna categoria trovata",
        `Vuoi creare alcune categorie di ${
          type === "EXPENSE" ? "spesa" : "entrata"
        } predefinite?`,
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Sì",
            onPress: async () => {
              try {
                setIsLoading(true);
                await fetchDefaultCategoriesByType(dispatch, type);
                // Ricarichiamo le categorie dopo aver creato quelle predefinite
                await dispatch(fetchCategoriesByType(type)).unwrap();
              } catch (error) {
                console.error("Errore creazione categorie predefinite:", error);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    }
  }, [
    categories,
    type,
    isCategoriesLoading,
    dispatch,
    isLoading,
    isEditMode,
    selectedCategoryId,
  ]);

  // Show alert for API errors - sempre chiamato
  useEffect(() => {
    if (transactionError) {
      Alert.alert("Errore", transactionError);
    }
  }, [transactionError]);

  // Filtra le categorie in base al tipo selezionato - Creiamo un valore memorizzato ma sempre eseguito
  const filteredCategories = useMemo(() => {
    // Assicurati che tipo sia una stringa maiuscola
    const currentType = type.toUpperCase();

    // Se le categorie non sono ancora caricate, ritorna un array vuoto
    if (!categories || categories.length === 0) {
      return [];
    }

    console.log(`Filtraggio categorie per tipo: ${currentType}`);
    console.log(`Categorie disponibili: ${categories.length}`);

    // Debug delle categorie caricate
    categories.forEach((cat, index) => {
      console.log(
        `Categoria ${index}: ID=${cat.id}, Nome=${cat.name}, Tipo=${
          cat.type || "undefined"
        }`
      );
    });

    // Mappa di categorie comuni per tipo
    const expenseCategories = [
      "grocery",
      "alimentari",
      "spesa",
      "bar",
      "restaurant",
      "ristorante",
      "car",
      "auto",
      "transport",
      "trasporti",
      "health",
      "salute",
      "home",
      "casa",
      "utilities",
      "bollette",
      "pets",
      "animali",
      "shopping",
      "acquisti",
      "technology",
      "tecnologia",
      "taxes",
      "tasse",
    ];

    const incomeCategories = [
      "salary",
      "stipendio",
      "bonus",
      "gift",
      "regalo",
      "investment",
      "investimento",
      "refund",
      "rimborso",
      "special",
      "speciale",
    ];

    // Filtra le categorie considerando sia il tipo esplicito che l'inferenza dal nome
    const filtered = categories.filter((category) => {
      if (!category) return false;

      // Se la categoria ha un tipo esplicito, utilizziamolo per il confronto
      if (category.type) {
        const categoryType = category.type.toUpperCase();
        const isMatch = categoryType === currentType;
        console.log(
          `Categoria ${category.name} con tipo esplicito ${categoryType} -> match: ${isMatch}`
        );
        return isMatch;
      }

      // Altrimenti, inferiamo il tipo dal nome della categoria
      const categoryName = category.name.toLowerCase();

      // Verifica se il nome della categoria è presente nella lista dei nomi comuni per le spese
      const isExpenseName = expenseCategories.some((name) =>
        categoryName.includes(name.toLowerCase())
      );

      // Verifica se il nome della categoria è presente nella lista dei nomi comuni per le entrate
      const isIncomeName = incomeCategories.some((name) =>
        categoryName.includes(name.toLowerCase())
      );

      // Se è stato identificato chiaramente come spesa o entrata
      if (isExpenseName && !isIncomeName) {
        console.log(`Categoria ${category.name} inferita come EXPENSE`);
        return currentType === "EXPENSE";
      }

      if (isIncomeName && !isExpenseName) {
        console.log(`Categoria ${category.name} inferita come INCOME`);
        return currentType === "INCOME";
      }

      // Se non riusciamo a determinare chiaramente, mostriamo la categoria in entrambi i tipi
      // In alternativa, potremmo considerare "Uncategorized" come una spesa
      if (categoryName.includes("uncategorized")) {
        console.log(`Categoria ${category.name} mostrata come spesa generica`);
        return currentType === "EXPENSE";
      }

      // Mostro per debug le categorie che non riusciamo a classificare
      console.log(
        `Categoria ${category.name} non classificata chiaramente - mostrata in entrambi i tipi`
      );
      return true; // Mostra in entrambi i tipi
    });

    console.log(`Found ${filtered.length} categories of type ${currentType}`);
    return filtered;
  }, [categories, type]);

  // Trova la categoria selezionata - Deve essere dopo filteredCategories
  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const validateForm = () => {
    let isValid = true;

    // Validate description
    if (!description) {
      setDescriptionError("La descrizione è obbligatoria");
      isValid = false;
    } else {
      setDescriptionError("");
    }

    // Validate amount
    if (!amount) {
      setAmountError("L'importo è obbligatorio");
      isValid = false;
    } else if (isNaN(parseFloat(amount.replace(",", ".")))) {
      setAmountError("L'importo deve essere un numero");
      isValid = false;
    } else if (parseFloat(amount.replace(",", ".")) <= 0) {
      setAmountError("L'importo deve essere maggiore di zero");
      isValid = false;
    } else {
      setAmountError("");
    }

    // Validate category
    if (!selectedCategoryId) {
      setCategoryError("La categoria è obbligatoria");
      isValid = false;
    } else {
      setCategoryError("");
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Log dei dati selezionati per la transazione
    console.log("Categoria selezionata:", selectedCategory);
    console.log("Tipo impostato:", type);

    // Determina il tipo della transazione in modo più robusto
    let effectiveType = type;
    // Se la categoria ha un tipo definito, usa quello
    if (selectedCategory && selectedCategory.type) {
      effectiveType = selectedCategory.type as "INCOME" | "EXPENSE";
      console.log("Usando il tipo dalla categoria:", effectiveType);
    }

    // Formatta l'importo come number con 2 decimali
    const parsedAmount = parseFloat(amount.replace(",", "."));
    // Utilizziamo Math.round per arrotondare a 2 decimali in modo preciso
    // moltiplicando e dividendo per 100 evitiamo problemi di precisione con i numeri in virgola mobile
    const formattedAmount = Math.round(parsedAmount * 100) / 100;

    const transactionData = {
      description,
      amount: formattedAmount, // Invia come stringa con precisione due decimali
      date: date.toISOString().split("T")[0],
      type: effectiveType,
      categoryId: selectedCategoryId!,
    };

    console.log("Dati transazione da inviare:", transactionData);

    try {
      if (isEditMode && transactionId) {
        // Modalità modifica
        await dispatch(
          updateTransaction({
            id: transactionId,
            data: transactionData,
          })
        ).unwrap();
        Alert.alert("Successo", "Transazione aggiornata con successo", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        // Modalità aggiunta
        await dispatch(createTransaction(transactionData)).unwrap();
        Alert.alert("Successo", "Transazione aggiunta con successo", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error: any) {
      console.error("Errore gestione transazione:", error);
      Alert.alert(
        "Errore",
        error?.message ||
          "Si è verificato un errore durante il salvataggio della transazione."
      );
    }
  };

  // Invece di un return precoce, renderizziamo un componente di caricamento se necessario
  if (
    isLoading ||
    isCategoriesLoading ||
    (isEditMode && isTransactionLoading && !selectedTransaction)
  ) {
    return (
      <LoadingScreen
        message={
          isEditMode ? "Caricamento transazione..." : "Caricamento categorie..."
        }
      />
    );
  }

  // Il rendering principale ora avviene sempre, con gli stessi hooks eseguiti in ogni caso
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView style={styles.container}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "EXPENSE"
                ? { backgroundColor: theme.colors.error }
                : { backgroundColor: theme.colors.border },
            ]}
            onPress={() => setType("EXPENSE")}
          >
            <Text
              style={{
                color: type === "EXPENSE" ? "white" : theme.colors.text,
                fontWeight: type === "EXPENSE" ? "bold" : "normal",
              }}
            >
              Spesa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "INCOME"
                ? { backgroundColor: theme.colors.success }
                : { backgroundColor: theme.colors.border },
            ]}
            onPress={() => setType("INCOME")}
          >
            <Text
              style={{
                color: type === "INCOME" ? "white" : theme.colors.text,
                fontWeight: type === "INCOME" ? "bold" : "normal",
              }}
            >
              Entrata
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Descrizione"
          value={description}
          onChangeText={setDescription}
          placeholder="Es. Spesa al supermercato"
          error={descriptionError}
          leftIcon="create-outline"
        />

        <Input
          label="Importo (€)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0,00"
          error={amountError}
          leftIcon="cash-outline"
        />

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Data</Text>
          <TouchableOpacity
            style={[
              styles.dateInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={theme.colors.primary}
              style={styles.dateIcon}
            />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {formatDate(date)}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Categoria
          </Text>
          <TouchableOpacity
            style={[
              styles.categorySelector,
              {
                backgroundColor: theme.colors.surface,
                borderColor: categoryError
                  ? theme.colors.error
                  : theme.colors.border,
              },
            ]}
            onPress={() => setShowCategorySelector(!showCategorySelector)}
          >
            {selectedCategory ? (
              <View style={styles.selectedCategory}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: selectedCategory.color },
                  ]}
                />
                <Text
                  style={[styles.categoryText, { color: theme.colors.text }]}
                >
                  {selectedCategory.name}
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.placeholderText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Seleziona una categoria
              </Text>
            )}
            <Ionicons
              name={
                showCategorySelector
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          {categoryError ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {categoryError}
            </Text>
          ) : null}
        </View>

        {showCategorySelector && (
          <View
            style={[
              styles.categoriesList,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    { borderBottomColor: theme.colors.border },
                  ]}
                  onPress={() => {
                    setSelectedCategoryId(category.id);
                    setShowCategorySelector(false);
                    setCategoryError("");
                  }}
                >
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <Text
                    style={[styles.categoryText, { color: theme.colors.text }]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCategoriesMessage}>
                <Text style={{ color: theme.colors.textSecondary }}>
                  Nessuna categoria{" "}
                  {type === "INCOME" ? "di entrata" : "di spesa"} disponibile
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <Button
            title="Annulla"
            variant="outline"
            onPress={() => navigation.goBack()}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={isEditMode ? "Aggiorna" : "Salva"}
            isLoading={isTransactionLoading}
            onPress={handleSubmit}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  categorySelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
  },
  categoriesList: {
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  emptyCategoriesMessage: {
    padding: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 32,
  },
});
