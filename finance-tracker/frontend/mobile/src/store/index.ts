import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import transactionReducer from "./slices/transactionSlice";
import categoryReducer from "./slices/categorySlice";
import dashboardReducer from "./slices/dashboardSlice";
import recurrentPaymentReducer from "./slices/recurrentPaymentSlice";
import savingsGoalReducer from "./slices/savingsGoalSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transaction: transactionReducer,
    category: categoryReducer,
    dashboard: dashboardReducer,
    recurrentPayment: recurrentPaymentReducer,
    savingsGoal: savingsGoalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
