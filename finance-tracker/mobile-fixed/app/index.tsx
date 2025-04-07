import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold text-primary">
        Benvenuto in Bud-Jet!
      </Text>
      <Text className="mt-2 text-sm text-gray-600">
        La tua app per la gestione delle finanze
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
