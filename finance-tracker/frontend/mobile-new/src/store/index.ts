import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { setTokenGetter } from "../services/api";

// Import reducers as they're created
import authReducer from "./slices/authSlice";
import transactionReducer from "./slices/transactionSlice";
import categoryReducer from "./slices/categorySlice";

export const store = configureStore({
  reducer: {
    // Add reducers as they are implemented
    auth: authReducer,
    transactions: transactionReducer,
    categories: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: [],
        ignoredActionPaths: [],
        ignoredPaths: [],
      },
    }),
});

// Set up token getter to avoid circular dependencies
setTokenGetter(() => store.getState().auth.token);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
