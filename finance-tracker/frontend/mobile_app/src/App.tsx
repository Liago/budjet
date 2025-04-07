import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./navigation/root-navigator";
import { ErrorProvider } from "./components/common/ErrorBoundary";

export default function App() {
  return (
    <Provider store={store}>
      <ErrorProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ErrorProvider>
    </Provider>
  );
}
