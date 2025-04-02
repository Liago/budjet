import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("notifications")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get all notifications for the current user" })
  @ApiResponse({ status: 200, description: "Returns all notifications" })
  async getAllNotifications(@Request() req) {
    const userId = req.user.id;
    return this.notificationsService.getAllNotifications(userId);
  }

  @Get("unread/count")
  @ApiOperation({ summary: "Get count of unread notifications" })
  @ApiResponse({
    status: 200,
    description: "Returns the count of unread notifications",
  })
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const unreadNotifications =
      await this.notificationsService.getUnreadNotifications(userId);
    return { count: unreadNotifications.length };
  }

  @Patch(":id/read")
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  async markAsRead(@Param("id") id: string, @Request() req) {
    // Verifica che la notifica appartenga all'utente (implementazione da fare nel servizio)
    await this.notificationsService.verifyOwnership(id, req.user.id);
    return this.notificationsService.markAsRead(id);
  }

  @Post("read-all")
  @ApiOperation({ summary: "Mark all notifications as read" })
  @ApiResponse({ status: 200, description: "All notifications marked as read" })
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a notification" })
  @ApiParam({ name: "id", description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification deleted" })
  async deleteNotification(@Param("id") id: string, @Request() req) {
    // Verifica che la notifica appartenga all'utente (implementazione da fare nel servizio)
    await this.notificationsService.verifyOwnership(id, req.user.id);
    return this.notificationsService.deleteNotification(id);
  }
}
