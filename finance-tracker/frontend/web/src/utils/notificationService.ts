import { toast, ToastT } from "sonner";

type NotificationType = "success" | "error" | "info" | "warning" | "loading";

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private show(
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ): ToastT {
    const toastOptions = {
      ...options,
      duration: options?.duration || 4000,
    };

    return toast[type](message, toastOptions);
  }

  public success(message: string, options?: NotificationOptions): ToastT {
    return this.show("success", message, options);
  }

  public error(message: string, options?: NotificationOptions): ToastT {
    return this.show("error", message, options);
  }

  public info(message: string, options?: NotificationOptions): ToastT {
    return this.show("info", message, options);
  }

  public warning(message: string, options?: NotificationOptions): ToastT {
    return this.show("warning", message, options);
  }

  public loading(message: string, options?: NotificationOptions): ToastT {
    return this.show("loading", message, options);
  }

  public promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options?: NotificationOptions
  ): Promise<T> {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    });
  }

  public dismiss(toastId?: number | string): void {
    toast.dismiss(toastId);
  }

  public confirmDialog(
    message: string,
    options?: Omit<NotificationOptions, "action" | "cancel">
  ): Promise<boolean> {
    return new Promise((resolve) => {
      toast(message, {
        ...options,
        duration: Infinity,
        description: "Questa azione non può essere annullata",
        style: {
          background: "linear-gradient(to right, #dc2626, #ef4444)",
          color: "#ffffff",
          border: "1px solid #dc2626",
          padding: "16px",
        },
        action: {
          label: "Conferma",
          onClick: () => resolve(true),
          style: {
            backgroundColor: "#ffffff",
            color: "#dc2626",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            fontWeight: "500",
          },
        },
        cancel: {
          label: "Annulla",
          onClick: () => resolve(false),
          style: {
            backgroundColor: "transparent",
            color: "#ffffff",
            border: "1px solid #ffffff",
            padding: "8px 16px",
            borderRadius: "6px",
            fontWeight: "500",
          },
        },
        onDismiss: () => resolve(false),
      });
    });
  }
}

export const notificationService = NotificationService.getInstance();
