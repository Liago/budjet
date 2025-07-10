import { useAppDispatch, useAppSelector } from "../hooks";
import {
  setSidebarOpen,
  toggleSidebar,
  setSidebarAlwaysOpen,
  updatePreferences,
  UIPreferences,
} from "../../store/slices/uiSlice";

export const useUIPreferences = () => {
  const dispatch = useAppDispatch();
  const { preferences, sidebarOpen } = useAppSelector((state) => state.ui);

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
