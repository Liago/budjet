import React from "react";
import { View, Dimensions } from "react-native";
import { ThemedText } from "../ThemedText";
import { PieChart } from "react-native-chart-kit";
import { colors } from "../../theme/colors";

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  totalAmount: number;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  data,
  totalAmount,
}) => {
  const chartData = data.map((item) => ({
    name: item.name,
    amount: item.amount,
    color: colors.primary,
    legendFontColor: colors.textPrimary,
    legendFontSize: 12,
  }));

  return (
    <View className="bg-white p-4 rounded-lg mb-4">
      <ThemedText className="text-lg font-semibold mb-4">
        Spese per Categoria
      </ThemedText>
      <PieChart
        data={chartData}
        width={Dimensions.get("window").width - 48}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend
        avoidFalseZero
      />
    </View>
  );
};
