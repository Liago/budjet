import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import {
  loadPreferencesFromStorage,
  updatePreferences,
  setSidebarOpen,
  toggleSidebar,
  setSidebarAlwaysOpen,
  UIPreferences,
} from "../../store/slices/uiSlice";

const STORAGE_KEY = "budjet-ui-preferences";

export const useUIPreferences = () => {
  const dispatch = useAppDispatch();
  const { preferences, sidebarOpen } = useAppSelector((state) => state.ui);

  // Carica le preferenze dal localStorage all'avvio
  useEffect(() => {
    try {
      const storedPreferences = localStorage.getItem(STORAGE_KEY);
      if (storedPreferences) {
        const parsed = JSON.parse(storedPreferences) as Partial<UIPreferences>;
        dispatch(loadPreferencesFromStorage(parsed));
      }
    } catch (error) {
      console.warn("Errore nel caricamento delle preferenze UI:", error);
    }
  }, [dispatch]);

  // Salva le preferenze nel localStorage quando cambiano
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn("Errore nel salvataggio delle preferenze UI:", error);
    }
  }, [preferences]);

  // Funzioni di utilità
  const updateUIPreferences = (newPreferences: Partial<UIPreferences>) => {
    dispatch(updatePreferences(newPreferences));
  };

  const setSidebarAlwaysOpenState = (alwaysOpen: boolean) => {
    dispatch(setSidebarAlwaysOpen(alwaysOpen));
  };

  const setSidebarOpenState = (open: boolean) => {
    // Se la sidebar deve essere sempre aperta, non permettiamo di chiuderla
    if (preferences.sidebarAlwaysOpen && !open) {
      return;
    }
    dispatch(setSidebarOpen(open));
  };

  const toggleSidebarState = () => {
    // Se la sidebar deve essere sempre aperta, non permettiamo il toggle
    if (preferences.sidebarAlwaysOpen) {
      return;
    }
    dispatch(toggleSidebar());
  };

  // Gestisce il comportamento hover della sidebar
  const handleSidebarMouseEnter = () => {
    if (!preferences.sidebarAlwaysOpen) {
      dispatch(setSidebarOpen(true));
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!preferences.sidebarAlwaysOpen) {
      dispatch(setSidebarOpen(false));
    }
  };

  return {
    preferences,
    sidebarOpen,
    updateUIPreferences,
    setSidebarAlwaysOpenState,
    setSidebarOpenState,
    toggleSidebarState,
    handleSidebarMouseEnter,
    handleSidebarMouseLeave,
  };
};
