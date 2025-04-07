import React from "react";
import { View, FlatList, SafeAreaView, TouchableOpacity } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { colors } from "../../theme/colors";

// Placeholder for category item
const CategoryItem = () => (
  <TouchableOpacity className="bg-white rounded-lg p-4 mb-2 shadow-sm">
    <View className="flex-row items-center">
      <View className="w-12 h-12 rounded-full bg-blue-500 mr-4" />
      <View className="flex-1">
        <ThemedText className="font-semibold">Nome Categoria</ThemedText>
        <ThemedText className="text-sm text-gray-500">0 transazioni</ThemedText>
      </View>
      <ThemedText className="text-lg font-bold">€0.00</ThemedText>
    </View>
  </TouchableOpacity>
);

export const CategoriesScreen = () => {
  // Placeholder data
  const categories = [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ThemedView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText className="text-xl font-bold">Categorie</ThemedText>
          <TouchableOpacity className="bg-primary rounded-full px-4 py-2">
            <ThemedText className="text-white">Nuova</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={() => <CategoryItem />}
          keyExtractor={(_, index) => index.toString()}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-8">
              <ThemedText className="text-gray-500">
                Nessuna categoria trovata
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
};
