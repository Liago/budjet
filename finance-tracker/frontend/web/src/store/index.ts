import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryReducer from "./slices/categorySlice";
import transactionReducer from "./slices/transactionSlice";
import dashboardReducer from "./slices/dashboardSlice";
import recurrentPaymentReducer from "./slices/recurrentPaymentSlice";
import uiReducer from "./slices/uiSlice";
import { createLogger } from "redux-logger";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Configurazione redux-logger
const logger = createLogger({
  collapsed: true, // Raggruppa i log in forma collassata
  diff: true, // Mostra le differenze tra gli stati
  colors: {
    title: () => "#4CAF50", // Colore titolo azione
    prevState: () => "#3F51B5", // Stato precedente
    action: () => "#FF9800", // Azione
    nextState: () => "#E91E63", // Nuovo stato
    error: () => "#F44336", // Errori
  },
});

// Middleware per persistenza automatica dello stato UI
const uiPersistenceMiddleware =
  (store: any) => (next: any) => (action: any) => {
    const result = next(action);

    // Se l'azione modifica lo stato UI, salva nel localStorage
    if (action.type?.startsWith("ui/")) {
      try {
        const state = store.getState();
        localStorage.setItem(
          "budjet-ui-preferences",
          JSON.stringify(state.ui.preferences)
        );
      } catch (error) {
        console.warn(
          "Errore nel salvataggio automatico delle preferenze UI:",
          error
        );
      }
    }

    return result;
  };

// Funzione per caricare lo stato UI dal localStorage
const loadUIStateFromStorage = () => {
  try {
    const storedPreferences = localStorage.getItem("budjet-ui-preferences");
    if (storedPreferences) {
      const preferences = JSON.parse(storedPreferences);
      return {
        preferences,
        sidebarOpen: preferences.sidebarAlwaysOpen || false,
      };
    }
  } catch (error) {
    console.warn("Errore nel caricamento delle preferenze UI:", error);
  }
  return undefined;
};

// Middleware condizionale in base all'ambiente
const isDevelopment =
  process.env.NODE_ENV === "development" ||
  import.meta.env?.MODE === "development";

// Stato iniziale con preferenze caricate dal localStorage
const preloadedState = {
  ui: loadUIStateFromStorage(),
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    transactions: transactionReducer,
    dashboard: dashboardReducer,
    recurrentPayments: recurrentPaymentReducer,
    ui: uiReducer,
  },
  preloadedState: preloadedState.ui ? { ui: preloadedState.ui } : undefined,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: false,
    }).concat(uiPersistenceMiddleware);

    // Aggiungi logger solo in sviluppo
    if (isDevelopment) {
      return middleware.concat(logger);
    }

    return middleware;
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
