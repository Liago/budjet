import React from "react";
import { View, FlatList, SafeAreaView } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { colors } from "../../theme/colors";

// Placeholder for transaction item
const TransactionItem = () => (
  <View className="bg-white rounded-lg p-4 mb-2 shadow-sm">
    <View className="flex-row justify-between items-center">
      <View>
        <ThemedText className="font-semibold">Nome Transazione</ThemedText>
        <ThemedText className="text-sm text-gray-500">Categoria</ThemedText>
      </View>
      <ThemedText className="text-lg font-bold text-red-600">-€0.00</ThemedText>
    </View>
    <ThemedText className="text-sm text-gray-500 mt-1">Data</ThemedText>
  </View>
);

export const TransactionsScreen = () => {
  // Placeholder data
  const transactions = [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ThemedView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText className="text-xl font-bold">Transazioni</ThemedText>
          <View className="bg-primary rounded-full px-4 py-2">
            <ThemedText className="text-white">Filtra</ThemedText>
          </View>
        </View>

        <FlatList
          data={transactions}
          renderItem={() => <TransactionItem />}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-8">
              <ThemedText className="text-gray-500">
                Nessuna transazione trovata
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
};
