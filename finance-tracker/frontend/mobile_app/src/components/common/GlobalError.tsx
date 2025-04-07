import React from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { ThemedText } from "../ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

interface GlobalErrorProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export const GlobalError: React.FC<GlobalErrorProps> = ({
  message,
  visible,
  onDismiss,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <View className="bg-red-500 px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          <Ionicons name="alert-circle" size={20} color="white" />
          <ThemedText className="text-white ml-2 flex-1">{message}</ThemedText>
        </View>
        <TouchableOpacity onPress={onDismiss} className="ml-4">
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
