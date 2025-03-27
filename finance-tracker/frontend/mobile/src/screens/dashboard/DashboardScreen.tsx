import React from "react";
import { View, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { TransactionChart } from "../../components/charts/TransactionChart";
import { useChartData } from "../../hooks/useChartData";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

// Placeholder components that will be implemented next
const BalanceCard = () => (
  <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
    <ThemedText className="text-lg font-semibold">Saldo Attuale</ThemedText>
    <ThemedText className="text-3xl font-bold mt-2">€0.00</ThemedText>
  </View>
);

const MonthlySummary = () => (
  <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
    <ThemedText className="text-lg font-semibold">Riepilogo Mensile</ThemedText>
    <View className="flex-row justify-between mt-2">
      <View>
        <ThemedText className="text-sm text-gray-600">Entrate</ThemedText>
        <ThemedText className="text-lg font-semibold text-green-600">
          €0.00
        </ThemedText>
      </View>
      <View>
        <ThemedText className="text-sm text-gray-600">Uscite</ThemedText>
        <ThemedText className="text-lg font-semibold text-red-600">
          €0.00
        </ThemedText>
      </View>
    </View>
  </View>
);

const RecentTransactions = () => (
  <View className="bg-white rounded-xl p-4 shadow-sm">
    <ThemedText className="text-lg font-semibold mb-4">
      Transazioni Recenti
    </ThemedText>
    <ThemedText className="text-gray-500">
      Nessuna transazione recente
    </ThemedText>
  </View>
);

export const DashboardScreen = () => {
  const navigation = useNavigation();
  const { monthlyData, categoryData } = useChartData();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4">
        <ThemedView className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <ThemedText className="text-2xl font-bold">Dashboard</ThemedText>
            <TouchableOpacity
              className="bg-primary p-2 rounded-full"
              onPress={() => navigation.navigate("AddTransaction")}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Monthly Overview Chart */}
          <TransactionChart
            data={monthlyData}
            title="Andamento Mensile"
            height={250}
          />

          {/* Expense Categories Chart */}
          <TransactionChart
            data={categoryData.expenses}
            title="Spese per Categoria"
            height={200}
          />

          {/* Income Categories Chart */}
          <TransactionChart
            data={categoryData.incomes}
            title="Entrate per Categoria"
            height={200}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};
