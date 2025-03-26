import React from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { colors } from "../../theme/colors";

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
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4">
        <ThemedView className="flex-1">
          <BalanceCard />
          <MonthlySummary />
          <RecentTransactions />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};
