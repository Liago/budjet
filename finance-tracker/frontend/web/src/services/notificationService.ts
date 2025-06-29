import {
  Notification,
  NotificationType,
  NotificationGroup,
  NotificationPreference,
} from "../types/notification";
import { apiService, API_URL } from "../utils/api";
import { toast } from "sonner";

class NotificationService {
  private static instance: NotificationService;
  private BASE_URL = "/direct/notifications"; // 🔧 Use direct endpoint

  private constructor() {
    // No initialization needed for real backend service
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Ottieni tutte le notifiche
  public async getNotifications(): Promise<Notification[]> {
    try {
      const notifications = await apiService.get<Notification[]>(this.BASE_URL);
      return notifications.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  // Ottieni il conteggio delle notifiche non lette
  public async getUnreadCount(): Promise<number> {
    try {
      const response = await apiService.get<{ count: number }>(
        `${this.BASE_URL}/unread/count`
      );
      return response.count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      // Fallback to calculating from all notifications if the dedicated endpoint fails
      const notifications = await this.getNotifications();
      return notifications.filter((notification) => !notification.read).length;
    }
  }

  // Marca una notifica come letta
  public async markAsRead(id: string): Promise<void> {
    try {
      await apiService.patch<void>(`${this.BASE_URL}/${id}/read`, {
        read: true,
      });
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  }

  // Marca tutte le notifiche come lette
  public async markAllAsRead(): Promise<void> {
    try {
      await apiService.post<void>(`${this.BASE_URL}/read-all`, {});
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Cancella una notifica
  public async deleteNotification(id: string): Promise<void> {
    try {
      await apiService.delete<void>(`${this.BASE_URL}/${id}`);
    } catch (error) {
      console.error(`Error deleting notification ${id}:`, error);
      throw error;
    }
  }

  // Raggruppa le notifiche per categoria (oggi, ieri, questa settimana, ecc.)
  public groupNotificationsByDate(
    notifications: Notification[]
  ): NotificationGroup[] {
    const now = new Date();
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();
    const yesterday = today - 24 * 60 * 60 * 1000;
    const lastWeek = today - 7 * 24 * 60 * 60 * 1000;

    const groups: NotificationGroup[] = [
      { date: "Oggi", notifications: [] },
      { date: "Ieri", notifications: [] },
      { date: "Questa settimana", notifications: [] },
      { date: "Precedenti", notifications: [] },
    ];

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt).getTime();

      if (date >= today) {
        groups[0].notifications.push(notification);
      } else if (date >= yesterday) {
        groups[1].notifications.push(notification);
      } else if (date >= lastWeek) {
        groups[2].notifications.push(notification);
      } else {
        groups[3].notifications.push(notification);
      }
    });

    // Rimuovi i gruppi vuoti
    return groups.filter((group) => group.notifications.length > 0);
  }

  // Metodi per gestire le preferenze di notifica
  async getNotificationPreferences(): Promise<NotificationPreference[]> {
    try {
      const response = await apiService.get<any>(
        `${this.BASE_URL}/preferences`
      );
      console.log("API response for preferences:", response);

      // Verifica se la risposta è nel formato corretto
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response && Array.isArray(response.preferences)) {
        return response.preferences;
      } else {
        console.error("Unexpected API response format:", response);
        return [];
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      return [];
    }
  }

  async updateNotificationPreferences(
    preferences: NotificationPreference[]
  ): Promise<boolean> {
    try {
      console.log("Sending preferences to API:", preferences);
      // Verifica che l'array sia formattato correttamente
      if (!Array.isArray(preferences)) {
        console.error("preferences must be an array");
        return false;
      }

      // Crea una versione pulita delle preferenze senza id per rispettare esattamente il DTO
      const cleanPreferences = preferences.map((pref) => ({
        type: pref.type,
        enabled: pref.enabled,
        channels: pref.channels,
      }));

      console.log("Clean preferences for API:", cleanPreferences);

      // Poiché il backend rifiuta la proprietà "preferences", proviamo a inviare direttamente l'array
      // Il controller poi avrà la responsabilità di estrarre i dati nel formato che si aspetta
      try {
        const response = await fetch(`${API_URL}/notifications/preferences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(cleanPreferences),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(JSON.stringify(errorData));
        }

        const data = await response.json();
        console.log("API response for updating preferences:", data);
        return true;
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      // Mostra il messaggio di errore all'utente
      toast.error("Impossibile aggiornare le preferenze. Riprova più tardi.");
      return false;
    }
  }

  async getDefaultNotificationPreferences(): Promise<NotificationPreference[]> {
    try {
      const response = await apiService.get<any>(
        `${this.BASE_URL}/preferences/default`
      );
      console.log("API response for default preferences:", response);

      // Verifica se la risposta è nel formato corretto
      if (Array.isArray(response)) {
        return response;
      } else if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response && Array.isArray(response.preferences)) {
        return response.preferences;
      } else {
        console.error(
          "Unexpected default preferences API response format:",
          response
        );
        return [];
      }
    } catch (error) {
      console.error("Error fetching default notification preferences:", error);
      return [];
    }
  }

  // Toast notification helpers
  success(message: string, options?: any) {
    return toast.success(message, options);
  }

  error(message: string, options?: any) {
    return toast.error(message, options);
  }

  info(message: string, options?: any) {
    return toast.info(message, options);
  }

  warning(message: string, options?: any) {
    return toast.warning(message, options);
  }

  loading(message: string, options?: any) {
    return toast.loading(message, options);
  }
}

export const notificationService = NotificationService.getInstance();
