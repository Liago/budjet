import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { XIcon } from "../Icons";

// Tipi di notifica che l'utente può configurare
interface NotificationPreference {
  type: string;
  label: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    app: boolean;
  };
}

// Props per il componente
interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<
  NotificationSettingsModalProps
> = ({ isOpen, onClose }) => {
  // Stato per le preferenze delle notifiche
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      type: "BUDGET_ALERT",
      label: "Avvisi budget",
      description:
        "Ricevi notifiche quando ti avvicini al limite del budget mensile",
      enabled: true,
      channels: {
        email: false,
        app: true,
      },
    },
    {
      type: "PAYMENT_REMINDER",
      label: "Promemoria pagamenti",
      description: "Ricevi notifiche per pagamenti ricorrenti in scadenza",
      enabled: true,
      channels: {
        email: true,
        app: true,
      },
    },
    {
      type: "TRANSACTION_ALERT",
      label: "Transazioni insolite",
      description: "Ricevi avvisi su transazioni di importo elevato o insolite",
      enabled: true,
      channels: {
        email: false,
        app: true,
      },
    },
    {
      type: "MILESTONE_REACHED",
      label: "Obiettivi raggiunti",
      description:
        "Ricevi notifiche quando raggiungi i tuoi obiettivi di risparmio",
      enabled: true,
      channels: {
        email: true,
        app: true,
      },
    },
    {
      type: "PERIOD_SUMMARY",
      label: "Riepiloghi periodici",
      description: "Ricevi riepiloghi settimanali e mensili delle tue finanze",
      enabled: true,
      channels: {
        email: true,
        app: true,
      },
    },
    {
      type: "TAX_DEADLINE",
      label: "Scadenze fiscali",
      description: "Ricevi promemoria per scadenze fiscali importanti",
      enabled: true,
      channels: {
        email: true,
        app: true,
      },
    },
    {
      type: "NEW_FEATURE",
      label: "Nuove funzionalità",
      description: "Ricevi notifiche sulle nuove funzionalità dell'app",
      enabled: true,
      channels: {
        email: false,
        app: true,
      },
    },
    {
      type: "PERSONALIZED_TIP",
      label: "Suggerimenti personalizzati",
      description:
        "Ricevi consigli personalizzati per gestire meglio le tue finanze",
      enabled: true,
      channels: {
        email: false,
        app: true,
      },
    },
  ]);

  // Toggle per abilitare/disabilitare un tipo di notifica
  const toggleNotificationType = (type: string) => {
    setPreferences(
      preferences.map((pref) =>
        pref.type === type ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  // Toggle per abilitare/disabilitare un canale specifico per un tipo di notifica
  const toggleChannel = (type: string, channel: "email" | "app") => {
    setPreferences(
      preferences.map((pref) =>
        pref.type === type
          ? {
              ...pref,
              channels: {
                ...pref.channels,
                [channel]: !pref.channels[channel],
              },
            }
          : pref
      )
    );
  };

  // Salva le impostazioni
  const saveSettings = () => {
    // Qui potremmo chiamare un API per salvare le preferenze
    console.log("Impostazioni salvate:", preferences);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay scuro */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Contenitore modale centrato */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full rounded-xl bg-white shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Impostazioni Notifiche
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Corpo */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Preferenze notifiche
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Seleziona i tipi di notifiche che desideri ricevere e come
                preferisci riceverle.
              </p>

              {/* Tabella delle preferenze */}
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tipo Notifica
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Abilitata
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Canali
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preferences.map((pref) => (
                      <tr key={pref.type}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {pref.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {pref.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              checked={pref.enabled}
                              onChange={() => toggleNotificationType(pref.type)}
                            />
                          </label>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                checked={pref.channels.app}
                                onChange={() => toggleChannel(pref.type, "app")}
                                disabled={!pref.enabled}
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                App
                              </span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                checked={pref.channels.email}
                                onChange={() =>
                                  toggleChannel(pref.type, "email")
                                }
                                disabled={!pref.enabled}
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Email
                              </span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Altre impostazioni */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Impostazioni generali
              </h3>

              <div className="space-y-4 mt-4">
                {/* Soglia avvisi budget */}
                <div>
                  <label
                    htmlFor="budget-threshold"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Soglia avvisi budget (%)
                  </label>
                  <select
                    id="budget-threshold"
                    name="budget-threshold"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue="80"
                  >
                    <option value="50">50% del budget</option>
                    <option value="70">70% del budget</option>
                    <option value="80">80% del budget</option>
                    <option value="90">90% del budget</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Ricevi un avviso quando raggiungi questa percentuale del tuo
                    budget mensile.
                  </p>
                </div>

                {/* Promemoria pagamenti */}
                <div>
                  <label
                    htmlFor="payment-reminder"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Promemoria pagamenti (giorni prima)
                  </label>
                  <select
                    id="payment-reminder"
                    name="payment-reminder"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue="3"
                  >
                    <option value="1">1 giorno prima</option>
                    <option value="2">2 giorni prima</option>
                    <option value="3">3 giorni prima</option>
                    <option value="5">5 giorni prima</option>
                    <option value="7">7 giorni prima</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Quanti giorni prima ricevere un promemoria per pagamenti
                    ricorrenti.
                  </p>
                </div>

                {/* Pulizia automatica */}
                <div>
                  <label
                    htmlFor="auto-cleanup"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Pulizia automatica notifiche
                  </label>
                  <select
                    id="auto-cleanup"
                    name="auto-cleanup"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue="30"
                  >
                    <option value="7">7 giorni</option>
                    <option value="14">14 giorni</option>
                    <option value="30">30 giorni</option>
                    <option value="90">90 giorni</option>
                    <option value="never">Mai (mantieni tutte)</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Rimuovi automaticamente le notifiche più vecchie di questo
                    periodo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con pulsanti */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3 rounded-b-xl">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onClose}
            >
              Annulla
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={saveSettings}
            >
              Salva impostazioni
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
