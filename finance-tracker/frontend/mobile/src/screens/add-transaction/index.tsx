import React, { useState, useEffect } from "react";
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
import { createTransaction } from "../../store/slices/transactionSlice";
import {
  fetchCategories,
  createCategory,
} from "../../store/slices/categorySlice";
import { Input } from "../../components/common/input";
import { Button } from "../../components/common/button";
import { LoadingScreen } from "../../components/common/LoadingScreen";
import { RootStackParamList } from "../../navigation";

type AddTransactionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddTransaction"
>;
type AddTransactionScreenRouteProp = RouteProp<
  RootStackParamList,
  "AddTransaction"
>;

export default function AddTransactionScreen() {
  const theme = useTheme();
  const navigation = useNavigation<AddTransactionScreenNavigationProp>();
  const route = useRoute<AddTransactionScreenRouteProp>();
  const dispatch = useAppDispatch();

  const { isLoading: isTransactionLoading, error: transactionError } =
    useAppSelector((state) => state.transaction);
  const { categories, isLoading: isCategoriesLoading } = useAppSelector(
    (state) => state.category
  );

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Form validation errors
  const [descriptionError, setDescriptionError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Aggiungi console log per le categorie caricate
  useEffect(() => {
    console.log("Categorie caricate:", categories);
    console.log("Tipo transazione corrente:", type);
    console.log(
      "Categorie filtrate:",
      categories.filter((category) => category.type === type)
    );

    // Se non ci sono categorie, creiamo alcune categorie predefinite
    if (categories.length === 0 && !isCategoriesLoading) {
      Alert.alert(
        "Nessuna categoria trovata",
        "Vuoi creare alcune categorie predefinite?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Sì",
            onPress: () => createDefaultCategories(),
          },
        ]
      );
    }
  }, [categories, type, isCategoriesLoading]);

  // Funzione per creare le categorie predefinite
  const createDefaultCategories = async () => {
    try {
      // Categorie di spesa
      const expenseCategories = [
        { name: "Alimentari", type: "EXPENSE", color: "#FF5733" },
        { name: "Trasporti", type: "EXPENSE", color: "#33A8FF" },
        { name: "Casa", type: "EXPENSE", color: "#33FF57" },
        { name: "Svago", type: "EXPENSE", color: "#FF33A8" },
        { name: "Salute", type: "EXPENSE", color: "#A833FF" },
      ];

      // Categorie di entrata
      const incomeCategories = [
        { name: "Stipendio", type: "INCOME", color: "#57FF33" },
        { name: "Bonus", type: "INCOME", color: "#33FFA8" },
        { name: "Regali", type: "INCOME", color: "#A8FF33" },
      ];

      // Crea le categorie
      const categories = [...expenseCategories, ...incomeCategories];

      // Mostra indicatore di caricamento
      Alert.alert(
        "Creazione categorie",
        "Sto creando le categorie predefinite..."
      );

      // Crea le categorie una alla volta
      for (const category of categories) {
        await dispatch(createCategory(category)).unwrap();
      }

      // Ricarica le categorie dopo averle create
      await dispatch(fetchCategories()).unwrap();

      Alert.alert("Successo", "Categorie predefinite create con successo!");
    } catch (error) {
      console.error(
        "Errore nella creazione delle categorie predefinite:",
        error
      );
      Alert.alert(
        "Errore",
        "Non è stato possibile creare le categorie predefinite"
      );
    }
  };

  // Show alert for API errors
  useEffect(() => {
    if (transactionError) {
      Alert.alert("Errore", transactionError);
    }
  }, [transactionError]);

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

    // Formatta l'importo come numero con 2 decimali, poi riconvertilo a numero
    const parsedAmount = parseFloat(amount.replace(",", "."));
    const formattedAmount = parseFloat(parsedAmount.toFixed(2));

    const transactionData = {
      description,
      amount: formattedAmount, // Invia come numero con precisione due decimali
      date: date.toISOString().split("T")[0],
      type: effectiveType,
      categoryId: selectedCategoryId!,
    };

    console.log("Dati transazione da inviare:", transactionData);

    try {
      await dispatch(createTransaction(transactionData)).unwrap();
      Alert.alert("Successo", "Transazione aggiunta con successo", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Errore creazione transazione:", error);
      Alert.alert(
        "Errore",
        error?.message ||
          "Si è verificato un errore durante il salvataggio della transazione."
      );
    }
  };

  if (isCategoriesLoading) {
    return <LoadingScreen message="Caricamento categorie..." />;
  }

  // Filtra le categorie in base al tipo selezionato
  const incomeCategories = ["Salary", "Bonus", "Income", "Special"];
  const filteredCategories = categories.filter((category) => {
    // Se la categoria ha già un tipo definito, usalo per il filtro
    if (category.type) {
      return category.type.toUpperCase() === type || category.type === type;
    }

    // Altrimenti, assegna un tipo basato sul nome della categoria
    // Le categorie con nomi specifici vengono considerate INCOME, tutte le altre EXPENSE
    const inferredType = incomeCategories.includes(category.name)
      ? "INCOME"
      : "EXPENSE";

    // Confronta il tipo inferito con il tipo selezionato
    return inferredType === type;
  });

  // Trova la categoria selezionata
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId
  );

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
            title="Salva"
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
