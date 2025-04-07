import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "styled-components/native";

import Navigation from "./src/navigation";
import { lightTheme, darkTheme } from "./src/theme";
import { StoreProvider } from "./src/store";

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <Navigation />
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
