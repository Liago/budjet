import {
  Notification,
  NotificationType,
  NotificationGroup,
} from "../types/notification";
import { apiService } from "../utils/api";

class NotificationService {
  private static instance: NotificationService;
  private BASE_URL = "/notifications";

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
      { title: "Oggi", notifications: [] },
      { title: "Ieri", notifications: [] },
      { title: "Questa settimana", notifications: [] },
      { title: "Precedenti", notifications: [] },
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
}

export const notificationService = NotificationService.getInstance();
