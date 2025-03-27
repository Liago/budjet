import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TextInput,
} from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { useError } from "../../hooks/useError";
import { colors } from "../../theme/colors";
import { addTransaction } from "../../store/slices/transactionSlice";
import { TransactionType } from "../../types/models";
import { Ionicons } from "@expo/vector-icons";

interface FormErrors {
  amount?: string;
  description?: string;
  category?: string;
}

export const AddTransactionScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showError } = useError();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!amount) {
      newErrors.amount = "L'importo è obbligatorio";
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = "Inserisci un importo valido";
    }

    if (!description.trim()) {
      newErrors.description = "La descrizione è obbligatoria";
    }

    if (!categoryId) {
      newErrors.category = "Seleziona una categoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        addTransaction({
          type,
          amount: parseFloat(amount),
          description: description.trim(),
          categoryId,
          date: date.toISOString(),
        })
      ).unwrap();
      navigation.goBack();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Si è verificato un errore durante il salvataggio della transazione"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4">
        <ThemedView className="flex-1">
          {/* Type Selection */}
          <View className="flex-row mb-6">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-l-lg ${
                type === "expense" ? "bg-primary" : "bg-gray-200"
              }`}
              onPress={() => setType("expense")}
            >
              <ThemedText
                className={`text-center font-semibold ${
                  type === "expense" ? "text-white" : "text-gray-600"
                }`}
              >
                Spesa
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-r-lg ${
                type === "income" ? "bg-primary" : "bg-gray-200"
              }`}
              onPress={() => setType("income")}
            >
              <ThemedText
                className={`text-center font-semibold ${
                  type === "income" ? "text-white" : "text-gray-600"
                }`}
              >
                Entrata
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <ThemedText className="text-lg font-semibold mb-2">
              Importo
            </ThemedText>
            <View className="flex-row items-center bg-white rounded-lg p-4">
              <ThemedText className="text-2xl mr-2">€</ThemedText>
              <TextInput
                className="flex-1 text-2xl"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (errors.amount) {
                    setErrors({ ...errors, amount: undefined });
                  }
                }}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <ErrorMessage
              message={errors.amount || ""}
              visible={!!errors.amount}
            />
          </View>

          {/* Description Input */}
          <View className="mb-6">
            <ThemedText className="text-lg font-semibold mb-2">
              Descrizione
            </ThemedText>
            <TextInput
              className="bg-white rounded-lg p-4"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) {
                  setErrors({ ...errors, description: undefined });
                }
              }}
              placeholder="Inserisci una descrizione"
              placeholderTextColor={colors.textSecondary}
            />
            <ErrorMessage
              message={errors.description || ""}
              visible={!!errors.description}
            />
          </View>

          {/* Category Selection */}
          <View className="mb-6">
            <ThemedText className="text-lg font-semibold mb-2">
              Categoria
            </ThemedText>
            <TouchableOpacity
              className="bg-white rounded-lg p-4 flex-row justify-between items-center"
              onPress={() => {
                navigation.navigate("CategorySelection", { type });
              }}
            >
              <ThemedText
                className={categoryId ? "text-black" : "text-gray-500"}
              >
                {categoryId
                  ? "Categoria selezionata"
                  : "Seleziona una categoria"}
              </ThemedText>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            <ErrorMessage
              message={errors.category || ""}
              visible={!!errors.category}
            />
          </View>

          {/* Date Selection */}
          <View className="mb-6">
            <ThemedText className="text-lg font-semibold mb-2">Data</ThemedText>
            <TouchableOpacity
              className="bg-white rounded-lg p-4 flex-row justify-between items-center"
              onPress={() => setShowDatePicker(true)}
            >
              <ThemedText>{date.toLocaleDateString()}</ThemedText>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`bg-primary rounded-lg py-4 mb-6 ${
              isSubmitting ? "opacity-50" : ""
            }`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <ThemedText className="text-white text-center font-semibold text-lg">
              {isSubmitting ? "Salvataggio..." : "Salva Transazione"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};
