import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationPreferenceDto } from "./dto/notification-preference.dto";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: string;
  enabled: boolean;
  channels: {
    email: boolean;
    app: boolean;
  };
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "error";
    }
  ) {
    return this.prisma.notification.create({
      data: {
        ...data,
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId },
      data: { isRead: true },
    });
  }

  async deleteNotification(id: string) {
    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async getUnreadNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getAllNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async verifyOwnership(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found`
      );
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        "You don't have permission to access this notification"
      );
    }

    return notification;
  }

  // Metodi per gestire le preferenze di notifica
  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreference[]> {
    const preferences = await this.prisma.notificationPreference.findMany({
      where: { userId },
    });

    return preferences.map((pref) => ({
      ...pref,
      channels: JSON.parse(pref.channels),
    }));
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: NotificationPreferenceDto[]
  ): Promise<NotificationPreference[]> {
    // Elimina tutte le preferenze esistenti dell'utente
    await this.prisma.notificationPreference.deleteMany({
      where: { userId },
    });

    // Crea le nuove preferenze
    const createdPrefs = await Promise.all(
      preferences.map(async (pref) => {
        return this.prisma.notificationPreference.create({
          data: {
            userId,
            type: pref.type,
            enabled: pref.enabled,
            channels: JSON.stringify(pref.channels),
          },
        });
      })
    );

    return createdPrefs.map((pref) => ({
      ...pref,
      channels: JSON.parse(pref.channels),
    }));
  }

  async getDefaultNotificationPreferences(): Promise<
    NotificationPreferenceDto[]
  > {
    return [
      {
        type: "BUDGET_ALERT",
        enabled: true,
        channels: { email: false, app: true },
      },
      {
        type: "PAYMENT_REMINDER",
        enabled: true,
        channels: { email: true, app: true },
      },
      {
        type: "TRANSACTION_ALERT",
        enabled: true,
        channels: { email: false, app: true },
      },
      {
        type: "MILESTONE_REACHED",
        enabled: true,
        channels: { email: true, app: true },
      },
      {
        type: "PERIOD_SUMMARY",
        enabled: true,
        channels: { email: true, app: true },
      },
      {
        type: "TAX_DEADLINE",
        enabled: true,
        channels: { email: true, app: true },
      },
      {
        type: "NEW_FEATURE",
        enabled: true,
        channels: { email: false, app: true },
      },
      {
        type: "PERSONALIZED_TIP",
        enabled: true,
        channels: { email: false, app: true },
      },
    ];
  }

  async shouldSendNotification(
    userId: string,
    notificationType: string,
    channel: "email" | "app"
  ): Promise<boolean> {
    // Cerca la preferenza dell'utente
    const preference = await this.prisma.notificationPreference.findFirst({
      where: {
        userId,
        type: notificationType,
      },
    });

    // Se non esiste o non è abilitata, non inviare
    if (!preference || !preference.enabled) {
      return false;
    }

    // Controlla il canale
    const channels = JSON.parse(preference.channels);
    return !!channels[channel];
  }
}
