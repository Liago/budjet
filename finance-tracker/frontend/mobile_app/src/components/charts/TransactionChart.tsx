import React from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ThemedText } from "../ThemedText";
import { colors } from "../../theme/colors";

interface TransactionChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }[];
  };
  title: string;
  height?: number;
}

export const TransactionChart: React.FC<TransactionChartProps> = ({
  data,
  title,
  height = 220,
}) => {
  const screenWidth = Dimensions.get("window").width;

  return (
    <View className="bg-white rounded-lg p-4 mb-4">
      <ThemedText className="text-lg font-semibold mb-4">{title}</ThemedText>
      <LineChart
        data={data}
        width={screenWidth - 48} // 24px padding on each side
        height={height}
        chartConfig={{
          backgroundColor: colors.background,
          backgroundGradientFrom: colors.background,
          backgroundGradientTo: colors.background,
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: colors.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: "", // solid lines
            stroke: colors.border,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};
