export type NotificationType =
  | "BUDGET_ALERT"
  | "PAYMENT_REMINDER"
  | "TRANSACTION_ALERT"
  | "MILESTONE_REACHED"
  | "PERIOD_SUMMARY"
  | "TAX_DEADLINE"
  | "NEW_FEATURE"
  | "PERSONALIZED_TIP";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: {
    [key: string]: any;
  };
  link?: string;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface NotificationPreference {
  id?: string;
  type: string;
  enabled: boolean;
  channels: {
    email: boolean;
    app: boolean;
  };
}
