import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import transactionReducer from './slices/transactionSlice';
import dashboardReducer from './slices/dashboardSlice';
import recurrentPaymentReducer from './slices/recurrentPaymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    transactions: transactionReducer,
    dashboard: dashboardReducer,
    recurrentPayments: recurrentPaymentReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks for interacting with the Redux store
export const useAppSelector = <T>(selector: (state: RootState) => T): T => selector(store.getState());
export const useAppDispatch = (): AppDispatch => store.dispatch; 