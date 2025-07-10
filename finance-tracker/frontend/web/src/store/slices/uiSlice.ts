import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UIPreferences {
  sidebarAlwaysOpen: boolean;
  theme: "light" | "dark" | "auto";
  language: string;
}

interface UIState {
  preferences: UIPreferences;
  sidebarOpen: boolean;
}

const initialState: UIState = {
  preferences: {
    sidebarAlwaysOpen: false, // Default: sidebar si apre al hover
    theme: "light",
    language: "it",
  },
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarAlwaysOpen: (state, action: PayloadAction<boolean>) => {
      state.preferences.sidebarAlwaysOpen = action.payload;
      // Se impostiamo sempre aperta, apriamola subito
      if (action.payload) {
        state.sidebarOpen = true;
      }
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "auto">) => {
      state.preferences.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UIPreferences>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };

      // Se abbiamo aggiornato sidebarAlwaysOpen e ora è true, apriamo la sidebar
      if (action.payload.sidebarAlwaysOpen === true) {
        state.sidebarOpen = true;
      }
    },
    loadPreferencesFromStorage: (
      state,
      action: PayloadAction<Partial<UIPreferences>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };

      // Se la sidebar dovrebbe essere sempre aperta, aprila
      if (state.preferences.sidebarAlwaysOpen) {
        state.sidebarOpen = true;
      }
    },
  },
});

export const {
  setSidebarOpen,
  toggleSidebar,
  setSidebarAlwaysOpen,
  setTheme,
  setLanguage,
  updatePreferences,
  loadPreferencesFromStorage,
} = uiSlice.actions;

export default uiSlice.reducer;
