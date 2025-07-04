import React, { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { apiService } from "../utils/api";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationPreference {
  type: string;
  enabled: boolean;
  channels: {
    email: boolean;
    app: boolean;
  };
}

export const UserPreferences = () => {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Tutti i campi sono obbligatori");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Le nuove password non corrispondono");
      return;
    }

    if (!validatePassword(passwordForm.newPassword)) {
      toast.error("La password deve essere di almeno 8 caratteri");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.post("/direct/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        toast.success("Password cambiata con successo!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.error || "Errore nel cambio password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Errore nel cambio password. Verifica la password attuale.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationPreferences = async () => {
    setPreferencesLoading(true);
    try {
      const data = await apiService.get("/direct/notifications/preferences");
      setPreferences(data);
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Errore nel caricamento delle preferenze");
    } finally {
      setPreferencesLoading(false);
    }
  };

  const saveNotificationPreferences = async () => {
    setPreferencesLoading(true);
    try {
      await apiService.post("/direct/notifications/preferences", {
        preferences,
      });
      toast.success("Preferenze notifiche salvate!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Errore nel salvataggio delle preferenze");
    } finally {
      setPreferencesLoading(false);
    }
  };

  const updatePreference = (index: number, field: string, value: any) => {
    const updated = [...preferences];
    if (field === "enabled") {
      updated[index].enabled = value;
    } else if (field.startsWith("channels.")) {
      const channel = field.split(".")[1];
      updated[index].channels[channel as "email" | "app"] = value;
    }
    setPreferences(updated);
  };

  const getPreferenceLabel = (type: string): string => {
    const labels: Record<string, string> = {
      BUDGET_ALERT: "Avvisi Budget",
      PAYMENT_REMINDER: "Promemoria Pagamenti",
      TRANSACTION_ALERT: "Avvisi Transazioni",
      MILESTONE_REACHED: "Traguardi Raggiunti",
      PERIOD_SUMMARY: "Riepilogo Periodico",
      TAX_DEADLINE: "Scadenze Fiscali",
      NEW_FEATURE: "Nuove Funzionalità",
      PERSONALIZED_TIP: "Consigli Personalizzati",
    };
    return labels[type] || type;
  };

  React.useEffect(() => {
    loadNotificationPreferences();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Preferenze Utente</h1>
      </div>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2-2v-6a2 2 0 012-2m0 0V7a2 2 0 012-2m6 0V7"
              />
            </svg>
            Cambia Password
          </CardTitle>
          <CardDescription>
            Aggiorna la tua password per mantenere l'account sicuro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="currentPassword">Password Attuale</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Nuova Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  La password deve essere di almeno 8 caratteri
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Cambiando...
                </>
              ) : (
                "Cambia Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4.5 5.653c0-.856.917-1.539 2.045-1.539s2.045.683 2.045 1.539c0 .856-.917 1.539-2.045 1.539s-2.045-.683-2.045-1.539zM15 5.653c0-.856.917-1.539 2.045-1.539s2.045.683 2.045 1.539c0 .856-.917 1.539-2.045 1.539s-2.045-.683-2.045-1.539z"
              />
            </svg>
            Preferenze Notifiche
          </CardTitle>
          <CardDescription>
            Configura quando e come ricevere le notifiche
          </CardDescription>
        </CardHeader>
        <CardContent>
          {preferencesLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-blue-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : (
            <div className="space-y-6">
              {preferences.map((pref, index) => (
                <div
                  key={pref.type}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {getPreferenceLabel(pref.type)}
                    </h4>
                    <div className="mt-2 flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={pref.enabled}
                          onChange={(e) =>
                            updatePreference(index, "enabled", e.target.checked)
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600">Attiva</span>
                      </label>

                      {pref.enabled && (
                        <>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pref.channels.email}
                              onChange={(e) =>
                                updatePreference(
                                  index,
                                  "channels.email",
                                  e.target.checked
                                )
                              }
                              className="rounded"
                            />
                            <span className="text-sm text-gray-600">Email</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pref.channels.app}
                              onChange={(e) =>
                                updatePreference(
                                  index,
                                  "channels.app",
                                  e.target.checked
                                )
                              }
                              className="rounded"
                            />
                            <span className="text-sm text-gray-600">App</span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={saveNotificationPreferences}
                disabled={preferencesLoading}
                className="w-full"
              >
                Salva Preferenze Notifiche
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
