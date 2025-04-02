import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsObject, IsString } from "class-validator";

export class NotificationPreferenceDto {
  @ApiProperty({
    example: "BUDGET_ALERT",
    description: "Notification type",
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: true,
    description: "Whether the notification is enabled",
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    example: { email: true, app: false },
    description: "Notification channels",
  })
  @IsObject()
  channels: {
    email: boolean;
    app: boolean;
  };
}

export class UpdateNotificationPreferencesDto {
  @ApiProperty({
    type: [NotificationPreferenceDto],
    description: "List of notification preferences",
  })
  preferences: NotificationPreferenceDto[];
}
