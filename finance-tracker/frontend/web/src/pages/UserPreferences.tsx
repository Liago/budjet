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
import { Switch } from "../components/ui/switch";
import { apiService } from "../utils/api";
import { useUIPreferences } from "../utils/hooks/useUIPreferences";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const UserPreferences = () => {
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Hook per le preferenze UI
  const { preferences, setSidebarAlwaysOpenState } = useUIPreferences();

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

  const handleSidebarPreferenceChange = (checked: boolean) => {
    setSidebarAlwaysOpenState(checked);
    toast.success(
      checked
        ? "Sidebar ora rimarrà sempre aperta"
        : "Sidebar tornerà al comportamento normale"
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Preferenze Utente</h1>
      </div>

      {/* UI Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Preferenze Interfaccia
          </CardTitle>
          <CardDescription>
            Personalizza il comportamento dell'interfaccia utente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sidebar-always-open" className="text-base">
                Sidebar sempre aperta
              </Label>
              <p className="text-sm text-gray-500">
                Mantieni la sidebar sempre espansa invece di aprirla al
                passaggio del mouse
              </p>
            </div>
            <Switch
              id="sidebar-always-open"
              checked={preferences.sidebarAlwaysOpen}
              onCheckedChange={handleSidebarPreferenceChange}
            />
          </div>
        </CardContent>
      </Card>

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

      {/* Info Box about Notifications */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <svg
              className="w-5 h-5"
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
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-3">
            Le preferenze per le notifiche sono gestite tramite l'icona delle
            notifiche nella barra superiore.
          </p>
          <p className="text-blue-600 text-sm">
            Clicca sull'icona 🔔 in alto a destra per configurare quando e come
            ricevere le notifiche.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
