import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { TransactionsScreen } from "../screens/transactions/TransactionsScreen";
import { CategoriesScreen } from "../screens/categories/CategoriesScreen";

const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom add transaction button
const AddTransactionButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity
    style={styles.addButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={styles.addButtonInner}>
      <Ionicons name="add" size={30} color="white" />
    </View>
  </TouchableOpacity>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTransactionButton"
        component={DashboardScreen} // Placeholder, never actually navigates here
        options={{
          tabBarButton: (props) => (
            <AddTransactionButton
              onPress={() => {
                // Navigate to add transaction screen
                // navigation.navigate('AddTransaction');
              }}
            />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="ellipsis-horizontal-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 10,
    height: 60,
    backgroundColor: "white",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButton: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default TabNavigator;
