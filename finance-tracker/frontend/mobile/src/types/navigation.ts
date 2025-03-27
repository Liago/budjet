import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { NavigatorScreenParams } from "@react-navigation/native";

// Define the screens in the app
export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // Main App Screens
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Transaction Screens
  TransactionDetails: { transactionId: string };
  AddTransaction: undefined;
  EditTransaction: { id: string };
  CategorySelection: { type: "income" | "expense" };

  // Category Screens
  Categories: undefined;
  AddCategory: undefined;
  EditCategory: { id: string };

  // Budget Screens
  Budgets: undefined;
  AddBudget: undefined;
  EditBudget: { budgetId: string };

  // Report Screens
  Reports: undefined;
  ReportDetails: { reportType: string; period: string };

  // Savings Goals
  SavingsGoals: undefined;
  AddSavingsGoal: undefined;
  EditSavingsGoal: { goalId: string };

  // Settings
  Settings: undefined;
  Profile: undefined;
  Preferences: undefined;
};

// Tab Navigator Screens
export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  AddTransactionButton: undefined;
  Categories: undefined;
  More: undefined;
  AddTransaction: undefined;
};

// Navigation props for each screen
export type NavigationProps<T extends keyof RootStackParamList> = {
  navigation: NativeStackNavigationProp<RootStackParamList, T>;
  route: RouteProp<RootStackParamList, T>;
};
