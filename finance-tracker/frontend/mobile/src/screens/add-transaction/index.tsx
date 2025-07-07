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
  Modal,
  Animated,
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
  deleteTransaction,
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

  // Stato per la modale di conferma eliminazione
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

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

  // Gestione apertura modale di eliminazione
  const showDeleteModal = () => {
    setIsDeleteModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Gestione chiusura modale di eliminazione
  const hideDeleteModal = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDeleteModalVisible(false);
      if (callback) callback();
    });
  };

  // Funzione per eliminare la transazione
  const handleDeleteTransaction = async () => {
    try {
      if (isEditMode && transactionId) {
        await dispatch(deleteTransaction(transactionId)).unwrap();
        hideDeleteModal(() => {
          navigation.goBack();
        });
      }
    } catch (error: any) {
      hideDeleteModal();
      console.error("Errore eliminazione transazione:", error);
      Alert.alert(
        "Errore",
        error?.message ||
          "Si è verificato un errore durante l'eliminazione della transazione."
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

  // Rendering della modale di conferma eliminazione
  const renderDeleteConfirmationModal = () => {
    return (
      <Modal
        transparent
        visible={isDeleteModalVisible}
        onRequestClose={() => hideDeleteModal()}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.colors.surface,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="trash-outline" size={28} color="#fff" />
              </View>
            </View>

            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Elimina transazione
            </Text>

            <Text
              style={[
                styles.modalDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              Sei sicuro di voler eliminare questa transazione? Questa azione
              non può essere annullata.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: theme.colors.border },
                ]}
                onPress={() => hideDeleteModal()}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                  Annulla
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteTransaction}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  Elimina
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

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
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerModal}>
              <View style={styles.datePickerContainer}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerCloseButton}
                  >
                    <Text style={styles.datePickerCloseText}>Annulla</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Seleziona Data</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.datePickerDoneButton}
                  >
                    <Text style={styles.datePickerDoneText}>Fatto</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>
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

        <View style={styles.buttonContainer}>
          <Button
            title={isEditMode ? "Aggiorna" : "Aggiungi"}
            onPress={handleSubmit}
            style={{ marginBottom: 12 }}
          />

          {isEditMode && (
            <TouchableOpacity
              style={[
                styles.deleteButton,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={showDeleteModal}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="#fff"
                style={styles.deleteButtonIcon}
              />
              <Text style={styles.deleteButtonText}>Elimina transazione</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Rendering della modale di conferma eliminazione */}
      {renderDeleteConfirmationModal()}
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
  buttonContainer: {
    marginVertical: 24,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#dc3545",
  },
  deleteButtonIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Stili per la modale di conferma
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  modalIconCircle: {
    backgroundColor: "#dc3545",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Stili per Date Picker Modal
  datePickerModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  datePickerContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  datePickerCloseButton: {
    padding: 8,
  },
  datePickerCloseText: {
    fontSize: 16,
    color: "#007AFF",
  },
  datePickerDoneButton: {
    padding: 8,
  },
  datePickerDoneText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  datePicker: {
    marginHorizontal: 20,
  },
});
