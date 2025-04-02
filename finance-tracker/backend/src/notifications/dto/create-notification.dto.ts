import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export type NotificationType = "info" | "success" | "warning" | "error";

export class CreateNotificationDto {
  @ApiProperty({ example: "Budget Alert", description: "Notification title" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: "You have reached 80% of your monthly budget",
    description: "Notification message",
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: "warning",
    description: "Notification type",
    enum: ["info", "success", "warning", "error"],
  })
  @IsEnum(["info", "success", "warning", "error"])
  @IsNotEmpty()
  type: NotificationType;
}
