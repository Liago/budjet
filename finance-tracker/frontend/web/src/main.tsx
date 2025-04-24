import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Componente semplificato per il build
const App = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Finance Tracker</h1>
      </header>
      <main>
        <p>Applicazione in caricamento...</p>
      </main>
      <footer>
        <p>&copy; 2024 Finance Tracker</p>
      </footer>
    </div>
  );
};

// Monta l'applicazione
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
