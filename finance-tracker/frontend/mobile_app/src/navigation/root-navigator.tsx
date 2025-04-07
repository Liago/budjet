import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useAppSelector } from "../store";
import TabNavigator from "./tab-navigator";
import { AddTransactionScreen } from "../screens/transactions/AddTransactionScreen";
import { CategorySelectionScreen } from "../screens/transactions/CategorySelectionScreen";

// Sample placeholder components for auth screens
// Will be replaced with actual screen components
const LoginScreen = () => <></>;
const RegisterScreen = () => <></>;
const ForgotPasswordScreen = () => <></>;

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  // Get authentication state from Redux
  const { token } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
          </>
        ) : (
          // Main app screens
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                headerShown: true,
                title: "Nuova Transazione",
              }}
            />
            <Stack.Screen
              name="CategorySelection"
              component={CategorySelectionScreen}
              options={{
                headerShown: true,
                title: "Seleziona Categoria",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
