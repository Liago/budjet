import { useState, useEffect } from "react";

type Theme = "dark" | "light";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Se un tema è già salvato nel localStorage, usalo
    const savedTheme = localStorage.getItem("theme") as Theme;
    // Altrimenti, controlla la preferenza di sistema
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return savedTheme || (prefersDark ? "dark" : "light");
  });

  useEffect(() => {
    // Aggiorna il localStorage quando il tema cambia
    localStorage.setItem("theme", theme);

    // Aggiorna la classe 'dark' sul documento html per Tailwind
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Funzione per alternare tra temi
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
  };
}
