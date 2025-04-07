import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

export interface NotificationSettings {
  budgetAlerts: boolean;
  monthlyReport: boolean;
  billReminders: boolean;
  savingsGoals: boolean;
}

class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    budgetAlerts: true,
    monthlyReport: true,
    billReminders: true,
    savingsGoals: true,
  };

  private constructor() {
    this.configureNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async configureNotifications() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }
  }

  public async getPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error("Error getting push token:", error);
      return null;
    }
  }

  public async scheduleBudgetAlert(
    category: string,
    amount: number,
    limit: number
  ) {
    if (!this.settings.budgetAlerts) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Avviso Budget",
        body: `Hai raggiunto l'${Math.round(
          (amount / limit) * 100
        )}% del tuo budget per ${category}`,
      },
      trigger: null,
    });
  }

  public async scheduleMonthlyReport() {
    if (!this.settings.monthlyReport) return;

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const trigger = new Date(nextMonth);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Report Mensile",
        body: "Il tuo report mensile è pronto! Controlla le tue statistiche.",
      },
      trigger: {
        date: trigger,
      },
    });
  }

  public async scheduleBillReminder(billName: string, dueDate: Date) {
    if (!this.settings.billReminders) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Promemoria Fattura",
        body: `La fattura ${billName} scade il ${dueDate.toLocaleDateString(
          "it-IT"
        )}`,
      },
      trigger: {
        date: dueDate,
      },
    });
  }

  public async scheduleSavingsGoal(
    goalName: string,
    progress: number,
    target: number
  ) {
    if (!this.settings.savingsGoals) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Obiettivo di Risparmio",
        body: `Hai raggiunto l'${Math.round(
          (progress / target) * 100
        )}% del tuo obiettivo ${goalName}`,
      },
      trigger: null,
    });
  }

  public updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings };
  }
}

export const notificationService = NotificationService.getInstance();
