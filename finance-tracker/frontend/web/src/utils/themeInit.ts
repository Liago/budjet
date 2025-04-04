// Inizializza il tema dell'applicazione al caricamento
export function initializeTheme() {
  // Controlla se esiste una preferenza salvata nel localStorage
  const savedTheme = localStorage.getItem("theme");

  // Se il tema è salvato come 'dark' o non c'è un tema salvato ma il sistema preferisce il tema scuro
  if (
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    // Aggiungi la classe 'dark' all'html per attivare gli stili dark di Tailwind
    document.documentElement.classList.add("dark");
  } else {
    // Rimuovi la classe 'dark' per usare gli stili light di Tailwind
    document.documentElement.classList.remove("dark");
  }
}
