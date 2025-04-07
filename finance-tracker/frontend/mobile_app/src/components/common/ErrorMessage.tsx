import React from "react";
import { View } from "react-native";
import { ThemedText } from "../ThemedText";
import { colors } from "../../theme/colors";

interface ErrorMessageProps {
  message: string;
  visible?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <View className="mt-1">
      <ThemedText className="text-red-500 text-sm">{message}</ThemedText>
    </View>
  );
};
