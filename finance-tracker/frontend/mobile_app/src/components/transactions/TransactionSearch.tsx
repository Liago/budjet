import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { ThemedText } from "../ThemedText";
import { colors } from "../../theme/colors";
import { Ionicons } from "@expo/vector-icons";

interface TransactionSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  value: string;
}

export const TransactionSearch: React.FC<TransactionSearchProps> = ({
  onSearch,
  onClear,
  value,
}) => {
  return (
    <View className="flex-row items-center bg-white p-4 rounded-lg mb-4">
      <View className="flex-1 flex-row items-center">
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          className="flex-1 ml-2 text-base"
          placeholder="Cerca transazioni..."
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} className="ml-2">
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
