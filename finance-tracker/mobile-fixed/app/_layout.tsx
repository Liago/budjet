import { Stack } from "expo-router";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

// Crea un reducer vuoto per iniziare
const initialStore = configureStore({
  reducer: {
    // Aggiungi i tuoi reducer qui
  },
});

// Utilizza SplashScreen di Expo in un'app reale
export default function RootLayout() {
  return (
    <Provider store={initialStore}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Bud-Jet",
            headerStyle: {
              backgroundColor: "#3498db",
            },
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </Provider>
  );
}
