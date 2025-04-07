import React from "react";
import { View, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { colors } from "../../theme/colors";
import { RootState } from "../../store";
import { Category } from "../../types/models";

export const CategorySelectionScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params as { type: "income" | "expense" };

  const categories = useSelector((state: RootState) =>
    state.categories.categories.filter((cat) => cat.type === type)
  );

  const handleSelectCategory = (category: Category) => {
    // TODO: Pass selected category back to AddTransactionScreen
    navigation.goBack();
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-2 flex-row items-center"
      onPress={() => handleSelectCategory(item)}
    >
      <View
        className="w-12 h-12 rounded-full mr-4"
        style={{ backgroundColor: item.color }}
      />
      <View className="flex-1">
        <ThemedText className="font-semibold">{item.name}</ThemedText>
        <ThemedText className="text-sm text-gray-500">
          {item.type === "income" ? "Entrata" : "Spesa"}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ThemedView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <ThemedText className="text-xl font-bold">
            {type === "income" ? "Categorie Entrate" : "Categorie Spese"}
          </ThemedText>
          <TouchableOpacity
            className="bg-primary rounded-full px-4 py-2"
            onPress={() => {
              // TODO: Navigate to add category screen
            }}
          >
            <ThemedText className="text-white">Nuova</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
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
