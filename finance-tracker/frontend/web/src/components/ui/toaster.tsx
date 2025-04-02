import { Toaster as SonnerToaster } from "sonner";

const toasterStyles = {
  success: {
    background: "linear-gradient(to right, #f0fdf4, #dcfce7)",
    border: "1px solid #bbf7d0",
    color: "#166534",
    icon: {
      color: "#16a34a",
    },
  },
  warning: {
    background: "linear-gradient(to right, #fefce8, #fef9c3)",
    border: "1px solid #fde047",
    color: "#854d0e",
    icon: {
      color: "#ca8a04",
    },
  },
  error: {
    background: "linear-gradient(to right, #fef2f2, #fee2e2)",
    border: "1px solid #fecaca",
    color: "#991b1b",
    icon: {
      color: "#dc2626",
    },
  },
  info: {
    background: "linear-gradient(to right, #f0f9ff, #e0f2fe)",
    border: "1px solid #bae6fd",
    color: "#0c4a6e",
    icon: {
      color: "#0284c7",
    },
  },
  loading: {
    background: "linear-gradient(to right, #f9fafb, #f3f4f6)",
    border: "1px solid #e5e7eb",
    color: "#1f2937",
    icon: {
      color: "#4b5563",
    },
  },
};

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          padding: "16px",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 500,
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        },
        classNames: {
          toast: "group relative",
          title: "font-medium text-sm",
          description: "text-sm mt-1 opacity-90",
          actionButton: "bg-primary",
          cancelButton: "bg-muted",
          closeButton:
            "absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity",
        },
        duration: 4000,
        closeButton: true,
      }}
      theme="light"
      richColors={false}
      closeButton
      style={{
        ["--normal-bg" as string]: toasterStyles.info.background,
        ["--normal-border" as string]: toasterStyles.info.border,
        ["--normal-text" as string]: toasterStyles.info.color,
        ["--success-bg" as string]: toasterStyles.success.background,
        ["--success-border" as string]: toasterStyles.success.border,
        ["--success-text" as string]: toasterStyles.success.color,
        ["--error-bg" as string]: toasterStyles.error.background,
        ["--error-border" as string]: toasterStyles.error.border,
        ["--error-text" as string]: toasterStyles.error.color,
        ["--warning-bg" as string]: toasterStyles.warning.background,
        ["--warning-border" as string]: toasterStyles.warning.border,
        ["--warning-text" as string]: toasterStyles.warning.color,
        ["--loading-bg" as string]: toasterStyles.loading.background,
        ["--loading-border" as string]: toasterStyles.loading.border,
        ["--loading-text" as string]: toasterStyles.loading.color,
      }}
    />
  );
}
