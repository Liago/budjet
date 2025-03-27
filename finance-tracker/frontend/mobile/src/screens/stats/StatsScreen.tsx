import React from "react";
import { View, ScrollView, SafeAreaView } from "react-native";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import { StatCard } from "../../components/stats/StatCard";
import { CategoryChart } from "../../components/stats/CategoryChart";
import { useTransactionStats } from "../../hooks/useTransactionStats";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

export const StatsScreen = () => {
  const stats = useTransactionStats();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ThemedView className="flex-1">
        <View className="p-4">
          <ThemedText className="text-2xl font-bold mb-4">
            Statistiche
          </ThemedText>
        </View>

        <ScrollView className="flex-1 px-4">
          {/* Overview Cards */}
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%]">
              <StatCard
                title="Entrate Totali"
                value={stats.totalIncome}
                color={colors.success}
                icon={
                  <Ionicons
                    name="arrow-up-circle"
                    size={24}
                    color={colors.success}
                  />
                }
              />
            </View>
            <View className="w-[48%]">
              <StatCard
                title="Spese Totali"
                value={stats.totalExpenses}
                color={colors.error}
                icon={
                  <Ionicons
                    name="arrow-down-circle"
                    size={24}
                    color={colors.error}
                  />
                }
              />
            </View>
          </View>

          <StatCard
            title="Saldo"
            value={stats.balance}
            subtitle={`Tasso di risparmio: ${stats.savingsRate.toFixed(1)}%`}
            color={stats.balance >= 0 ? colors.success : colors.error}
            icon={
              <Ionicons
                name={stats.balance >= 0 ? "trending-up" : "trending-down"}
                size={24}
                color={stats.balance >= 0 ? colors.success : colors.error}
              />
            }
          />

          <StatCard
            title="Media Transazioni"
            value={stats.averageTransactionAmount}
            subtitle={`${stats.topCategories.length} categorie principali`}
            icon={
              <Ionicons name="analytics" size={24} color={colors.primary} />
            }
          />

          {/* Category Chart */}
          <CategoryChart
            data={stats.topCategories}
            totalAmount={stats.totalExpenses}
          />

          {/* Monthly Trend */}
          <View className="bg-white p-4 rounded-lg mb-4">
            <ThemedText className="text-lg font-semibold mb-4">
              Andamento Mensile
            </ThemedText>
            {stats.monthlyTrend.map((month, index) => (
              <View
                key={month.month}
                className="flex-row justify-between items-center py-2"
              >
                <ThemedText className="text-sm text-gray-600">
                  {new Date(month.month).toLocaleDateString("it-IT", {
                    month: "long",
                    year: "numeric",
                  })}
                </ThemedText>
                <View className="flex-row">
                  <ThemedText className="text-sm text-green-600 mr-4">
                    +€{month.income.toFixed(2)}
                  </ThemedText>
                  <ThemedText className="text-sm text-red-600">
                    -€{month.expenses.toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
};
