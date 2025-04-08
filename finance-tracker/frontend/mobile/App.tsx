import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "styled-components/native";
import { Provider, useDispatch } from "react-redux";

import Navigation from "./src/navigation";
import { lightTheme, darkTheme } from "./src/theme";
import { store } from "./src/store";
import { initializeAuth } from "./src/store/slices/authSlice";

// Componente interno per inizializzare lo stato dell'app
function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppInitializer>
              <Navigation />
            </AppInitializer>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  );
}
