import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
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
}
