import React from "react";
import { CurrencyDisplay } from "./currency-display";

export const CurrencyShowcase: React.FC = () => {
  const sampleTransactions = [
    { amount: 2500.0, type: "INCOME" as const, description: "Stipendio" },
    { amount: 79.76, type: "EXPENSE" as const, description: "Bolletta Acqua" },
    { amount: 1234.56, type: "EXPENSE" as const, description: "Affitto" },
    { amount: 50.0, type: "INCOME" as const, description: "Rimborso" },
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">
        🏦 Standard Bancari - Visualizzazione Importi
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Variante Default */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Default Style
          </h4>
          <div className="border rounded p-3 space-y-2">
            {sampleTransactions.map((tx, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className="text-sm">{tx.description}</span>
                <CurrencyDisplay
                  amount={tx.amount}
                  type={tx.type}
                  variant="default"
                  showType={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Variante Banking */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Banking Style
          </h4>
          <div className="border rounded p-3 space-y-2">
            {sampleTransactions.map((tx, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className="text-sm">{tx.description}</span>
                <CurrencyDisplay
                  amount={tx.amount}
                  type={tx.type}
                  variant="banking"
                  showType={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Variante Detailed */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Detailed Style
          </h4>
          <div className="border rounded p-3 space-y-2">
            {sampleTransactions.map((tx, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className="text-sm">{tx.description}</span>
                <CurrencyDisplay
                  amount={tx.amount}
                  type={tx.type}
                  variant="detailed"
                  showType={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Variante Compact */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Compact Style
          </h4>
          <div className="border rounded p-3 space-y-2">
            {sampleTransactions.map((tx, i) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className="text-sm">{tx.description}</span>
                <CurrencyDisplay
                  amount={tx.amount}
                  type={tx.type}
                  variant="compact"
                  showType={true}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banking Standards Info */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          🏛️ Standard Bancari Implementati
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>
            ✅ <strong>Font Monospace</strong> - Allineamento perfetto dei
            decimali
          </li>
          <li>
            ✅ <strong>Formattazione IT</strong> - Separatori migliaia e
            decimali europei
          </li>
          <li>
            ✅ <strong>Colori Standard</strong> - Verde per entrate, rosso per
            uscite
          </li>
          <li>
            ✅ <strong>Allineamento</strong> - Importi allineati a destra
          </li>
          <li>
            ✅ <strong>Segni Chiari</strong> - "+" per entrate, nessun segno per
            uscite
          </li>
          <li>
            ✅ <strong>Accessibilità</strong> - Contrasto WCAG 2.1 AA compliant
          </li>
        </ul>
      </div>
    </div>
  );
};
