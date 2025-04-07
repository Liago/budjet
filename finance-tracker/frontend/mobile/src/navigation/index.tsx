import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'styled-components/native';
import { Ionicons } from '@expo/vector-icons';

// Screens
import DashboardScreen from '../screens/dashboard';
import BudgetDetailScreen from '../screens/budget-detail';
import AddTransactionScreen from '../screens/add-transaction';
import SettingsScreen from '../screens/settings';
import StatisticsScreen from '../screens/statistics';

// Types
export type RootStackParamList = {
  MainTabs: undefined;
  BudgetDetail: { budgetId: string };
  AddTransaction: { budgetId?: string };
};

export type MainTabsParamList = {
  Dashboard: undefined;
  Statistics: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: theme.spacing.sm,
          height: 60,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: theme.typography.fontSizes.lg,
          fontWeight: theme.typography.fontWeights.bold,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'BudJet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'Statistiche',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Impostazioni',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        headerTitleStyle: {
          color: theme.colors.text,
          fontSize: theme.typography.fontSizes.lg,
          fontWeight: theme.typography.fontWeights.bold,
        },
        headerTintColor: theme.colors.primary,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BudgetDetail"
        component={BudgetDetailScreen}
        options={{ title: 'Dettagli Budget' }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ title: 'Aggiungi Transazione' }}
      />
    </Stack.Navigator>
  );
}