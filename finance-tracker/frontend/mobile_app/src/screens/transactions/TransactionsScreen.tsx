import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import {
  TransactionFilters,
  TransactionFilters as TransactionFiltersType,
} from "../../components/transactions/TransactionFilters";
import { TransactionSearch } from "../../components/transactions/TransactionSearch";
import { useSearchTransactions } from "../../hooks/useSearchTransactions";
import { RootState } from "../../store";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

export const TransactionsScreen = () => {
  const navigation = useNavigation();
  const categories = useSelector((state: RootState) => state.categories.items);
  const [filters, setFilters] = useState<TransactionFiltersType>({});
  const [searchQuery, setSearchQuery] = useState("");
  const filteredTransactions = useSearchTransactions(searchQuery, filters);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-lg mb-2"
      onPress={() =>
        navigation.navigate("EditTransaction", { transaction: item })
      }
    >
      <View className="flex-row justify-between items-center">
        <View>
          <ThemedText className="text-lg font-semibold">
            {item.description}
          </ThemedText>
          <ThemedText className="text-sm text-gray-600">
            {new Date(item.date).toLocaleDateString("it-IT")}
          </ThemedText>
        </View>
        <ThemedText
          className={`text-lg font-bold ${
            item.type === "income" ? "text-green-600" : "text-red-600"
          }`}
        >
          {item.type === "income" ? "+" : "-"}€{item.amount.toFixed(2)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ThemedView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4">
          <ThemedText className="text-2xl font-bold">Transazioni</ThemedText>
          <TouchableOpacity
            className="bg-primary p-2 rounded-full"
            onPress={() => navigation.navigate("AddTransaction")}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TransactionSearch
          value={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />

        {/* Filters */}
        <TransactionFilters
          categories={categories}
          onFilterChange={setFilters}
        />

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4"
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
