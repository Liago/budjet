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
import { fetchCategories } from "../../store/slices/categorySlice";
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

    const transactionData = {
      description,
      amount: parseFloat(amount.replace(",", ".")),
      date: date.toISOString().split("T")[0],
      type,
      categoryId: selectedCategoryId!,
    };

    try {
      await dispatch(createTransaction(transactionData)).unwrap();
      Alert.alert("Successo", "Transazione aggiunta con successo", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      // L'errore viene già gestito nell'effect
    }
  };

  if (isCategoriesLoading) {
    return <LoadingScreen message="Caricamento categorie..." />;
  }

  // Filtra le categorie in base al tipo selezionato
  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

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
