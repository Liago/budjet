import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "../Icons";
import { notificationService } from "../../services/notificationService";
import { NotificationPreference } from "../../types/notification";
import { toast } from "sonner";
import { Switch } from "./switch";

// Props per il componente
interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
}: NotificationSettingsModalProps) {
  // Stato per le preferenze delle notifiche
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Carica le preferenze dell'utente all'apertura
  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const prefs = await notificationService.getNotificationPreferences();
      console.log("Preferenze ricevute dall'API:", prefs);

      if (prefs && Array.isArray(prefs) && prefs.length > 0) {
        console.log("Impostazione preferenze esistenti:", prefs);
        setPreferences(prefs);
      } else {
        // Se non ci sono preferenze, usa quelle di default
        console.log("Nessuna preferenza esistente, caricamento default");
        const defaultPrefs =
          await notificationService.getDefaultNotificationPreferences();
        console.log("Preferenze default ricevute:", defaultPrefs);

        if (
          defaultPrefs &&
          Array.isArray(defaultPrefs) &&
          defaultPrefs.length > 0
        ) {
          setPreferences(defaultPrefs);
        } else {
          console.error("Nessuna preferenza default ricevuta");
          setError("Errore nel caricamento delle preferenze predefinite");
          toast.error("Errore nel caricamento delle preferenze predefinite");
        }
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
      setError("Impossibile caricare le preferenze delle notifiche");
      toast.error("Impossibile caricare le preferenze delle notifiche");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle per abilitare/disabilitare un tipo di notifica
  const toggleNotificationType = (type: string) => {
    console.log("Toggle tipo notifica:", type);
    setPreferences((prevPreferences) =>
      prevPreferences.map((pref) =>
        pref.type === type ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  // Toggle per abilitare/disabilitare un canale specifico per un tipo di notifica
  const toggleChannel = (type: string, channel: "email" | "app") => {
    console.log("Toggle canale:", type, channel);
    setPreferences((prevPreferences) =>
      prevPreferences.map((pref) =>
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
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      console.log("Salvataggio preferenze:", preferences);
      const success = await notificationService.updateNotificationPreferences(
        preferences
      );
      if (success) {
        toast.success("Preferenze notifiche salvate con successo");
        onClose();
      } else {
        toast.error("Errore durante il salvataggio delle preferenze");
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Errore durante il salvataggio delle preferenze");
    } finally {
      setIsSaving(false);
    }
  };

  // Funzioni helper per ottenere label e descrizioni dai tipi
  function getLabelFromType(type: string): string {
    const labels: Record<string, string> = {
      BUDGET_ALERT: "Avvisi budget",
      PAYMENT_REMINDER: "Promemoria pagamenti",
      TRANSACTION_ALERT: "Transazioni insolite",
      MILESTONE_REACHED: "Obiettivi raggiunti",
      PERIOD_SUMMARY: "Riepiloghi periodici",
      TAX_DEADLINE: "Scadenze fiscali",
      NEW_FEATURE: "Nuove funzionalità",
      PERSONALIZED_TIP: "Suggerimenti personalizzati",
    };
    return labels[type] || type;
  }

  function getDescriptionFromType(type: string): string {
    const descriptions: Record<string, string> = {
      BUDGET_ALERT:
        "Ricevi notifiche quando ti avvicini al limite del budget mensile",
      PAYMENT_REMINDER: "Ricevi notifiche per pagamenti ricorrenti in scadenza",
      TRANSACTION_ALERT:
        "Ricevi avvisi su transazioni di importo elevato o insolite",
      MILESTONE_REACHED:
        "Ricevi notifiche quando raggiungi i tuoi obiettivi di risparmio",
      PERIOD_SUMMARY:
        "Ricevi riepiloghi settimanali e mensili delle tue finanze",
      TAX_DEADLINE: "Ricevi promemoria per scadenze fiscali importanti",
      NEW_FEATURE: "Ricevi notifiche sulle nuove funzionalità dell'app",
      PERSONALIZED_TIP:
        "Ricevi consigli personalizzati per gestire meglio le tue finanze",
    };
    return descriptions[type] || "";
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div
          className="fixed inset-0 bg-black bg-opacity-25"
          aria-hidden="true"
        />

        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-50" />
          </Transition.Child>

          {/* Questa div è per centrare il modale */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-3xl my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-medium leading-6 text-gray-900"
                >
                  Impostazioni Notifiche
                </Dialog.Title>
                <button
                  type="button"
                  className="p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Chiudi</span>
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <div className="text-red-500 mb-3">{error}</div>
                    <button
                      onClick={loadPreferences}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Riprova
                    </button>
                  </div>
                ) : preferences.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-gray-500 mb-3">
                      Nessuna preferenza disponibile
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Preferenze notifiche
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Seleziona i tipi di notifiche che desideri ricevere e
                        come preferisci riceverle.
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
                                    {getLabelFromType(pref.type)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {getDescriptionFromType(pref.type)}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center">
                                    <Switch
                                      checked={pref.enabled}
                                      onCheckedChange={() =>
                                        toggleNotificationType(pref.type)
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex space-x-4">
                                    <label className="inline-flex items-center space-x-2">
                                      <Switch
                                        checked={pref.channels?.app || false}
                                        onCheckedChange={() =>
                                          toggleChannel(pref.type, "app")
                                        }
                                        disabled={!pref.enabled}
                                      />
                                      <span className="text-sm text-gray-700">
                                        App
                                      </span>
                                    </label>
                                    <label className="inline-flex items-center space-x-2">
                                      <Switch
                                        checked={pref.channels?.email || false}
                                        onCheckedChange={() =>
                                          toggleChannel(pref.type, "email")
                                        }
                                        disabled={!pref.enabled}
                                      />
                                      <span className="text-sm text-gray-700">
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
                  </>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                  onClick={onClose}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={saveSettings}
                  disabled={isLoading || isSaving || preferences.length === 0}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Salvataggio...
                    </span>
                  ) : (
                    "Salva impostazioni"
                  )}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
