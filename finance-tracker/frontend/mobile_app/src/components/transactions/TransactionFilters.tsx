import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { ThemedText } from "../ThemedText";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Category } from "../../types/models";

interface TransactionFiltersProps {
  categories: Category[];
  onFilterChange: (filters: TransactionFilters) => void;
}

export interface TransactionFilters {
  type?: "income" | "expense";
  categoryId?: string;
  period?: "all" | "today" | "week" | "month" | "year";
  minAmount?: number;
  maxAmount?: number;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  categories,
  onFilterChange,
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (newFilters: TransactionFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const periods = [
    { id: "all", label: "Tutto" },
    { id: "today", label: "Oggi" },
    { id: "week", label: "Questa settimana" },
    { id: "month", label: "Questo mese" },
    { id: "year", label: "Questo anno" },
  ];

  return (
    <View className="mb-4">
      <TouchableOpacity
        className="flex-row items-center justify-between bg-white p-4 rounded-lg"
        onPress={() => setShowFilters(!showFilters)}
      >
        <ThemedText className="text-lg font-semibold">Filtri</ThemedText>
        <Ionicons
          name={showFilters ? "chevron-up" : "chevron-down"}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {showFilters && (
        <View className="bg-white rounded-lg p-4 mt-2">
          {/* Type Filter */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2">Tipo</ThemedText>
            <View className="flex-row">
              <TouchableOpacity
                className={`flex-1 py-2 rounded-l-lg ${
                  filters.type === "expense" ? "bg-primary" : "bg-gray-200"
                }`}
                onPress={() => handleFilterChange({ type: "expense" })}
              >
                <ThemedText
                  className={`text-center ${
                    filters.type === "expense" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Spese
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 rounded-r-lg ${
                  filters.type === "income" ? "bg-primary" : "bg-gray-200"
                }`}
                onPress={() => handleFilterChange({ type: "income" })}
              >
                <ThemedText
                  className={`text-center ${
                    filters.type === "income" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Entrate
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Period Filter */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2">
              Periodo
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    filters.period === period.id ? "bg-primary" : "bg-gray-200"
                  }`}
                  onPress={() =>
                    handleFilterChange({
                      period: period.id as TransactionFilters["period"],
                    })
                  }
                >
                  <ThemedText
                    className={
                      filters.period === period.id
                        ? "text-white"
                        : "text-gray-600"
                    }
                  >
                    {period.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Filter */}
          <View className="mb-4">
            <ThemedText className="text-sm font-medium mb-2">
              Categoria
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`px-4 py-2 rounded-full mr-2 ${
                    filters.categoryId === category.id
                      ? "bg-primary"
                      : "bg-gray-200"
                  }`}
                  onPress={() =>
                    handleFilterChange({ categoryId: category.id })
                  }
                >
                  <ThemedText
                    className={
                      filters.categoryId === category.id
                        ? "text-white"
                        : "text-gray-600"
                    }
                  >
                    {category.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Clear Filters */}
          <TouchableOpacity
            className="bg-gray-100 py-2 rounded-lg"
            onPress={clearFilters}
          >
            <ThemedText className="text-center text-gray-600">
              Rimuovi Filtri
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
