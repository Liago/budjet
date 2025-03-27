import React from "react";
import { View } from "react-native";
import { ThemedText } from "../ThemedText";
import { colors } from "../../theme/colors";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = colors.primary,
}) => {
  return (
    <View className="bg-white p-4 rounded-lg mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <ThemedText className="text-sm text-gray-600 mb-1">
            {title}
          </ThemedText>
          <ThemedText className="text-2xl font-bold" style={{ color }}>
            {typeof value === "number" ? `€${value.toFixed(2)}` : value}
          </ThemedText>
          {subtitle && (
            <ThemedText className="text-sm text-gray-500 mt-1">
              {subtitle}
            </ThemedText>
          )}
        </View>
        {icon && <View className="ml-4">{icon}</View>}
      </View>
    </View>
  );
};
