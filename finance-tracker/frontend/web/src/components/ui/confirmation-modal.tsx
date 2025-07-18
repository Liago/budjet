import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Note: Alert component not available, using custom styling
import { 
  AlertTriangle, 
  Trash2, 
  Info, 
  CheckCircle, 
  XCircle,
  Loader2 
} from "lucide-react";

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "info";
  loading?: boolean;
  children?: React.ReactNode;
}

const variantConfig = {
  default: {
    icon: CheckCircle,
    alertVariant: "default" as const,
    confirmVariant: "default" as const,
    iconColor: "text-blue-500",
  },
  destructive: {
    icon: Trash2,
    alertVariant: "destructive" as const,
    confirmVariant: "destructive" as const,
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    alertVariant: "default" as const,
    confirmVariant: "default" as const,
    iconColor: "text-yellow-500",
  },
  info: {
    icon: Info,
    alertVariant: "default" as const,
    confirmVariant: "default" as const,
    iconColor: "text-blue-500",
  },
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Conferma",
  cancelText = "Annulla",
  variant = "default",
  loading = false,
  children,
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Errore durante la conferma:", error);
      // The error handling should be done by the parent component
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          {children}
          
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Additional specialized components for common use cases
export interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  itemType?: string;
  loading?: boolean;
  warning?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  itemName,
  itemType = "elemento",
  loading = false,
  warning,
}) => {
  return (
    <ConfirmationModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Elimina ${itemType}`}
      description={`Sei sicuro di voler eliminare "${itemName}"?`}
      confirmText="Elimina"
      cancelText="Annulla"
      variant="destructive"
      loading={loading}
    >
      {warning && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{warning}</p>
        </div>
      )}
    </ConfirmationModal>
  );
};

export interface InfoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "info" | "warning" | "error" | "success";
}

export const InfoModal: React.FC<InfoModalProps> = ({
  open,
  onClose,
  title,
  message,
  variant = "info",
}) => {
  const iconMap = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle,
  };

  const colorMap = {
    info: "text-blue-500",
    warning: "text-yellow-500",
    error: "text-red-500",
    success: "text-green-500",
  };

  const Icon = iconMap[variant];
  const iconColor = colorMap[variant];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export interface InputModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void | Promise<void>;
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: "text" | "number" | "email" | "password";
  validation?: (value: string) => string | null;
  loading?: boolean;
}

export const InputModal: React.FC<InputModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  label,
  placeholder,
  defaultValue = "",
  inputType = "text",
  validation,
  loading = false,
}) => {
  const [value, setValue] = React.useState(defaultValue);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setValue(defaultValue);
    setError(null);
  }, [defaultValue, open]);

  const handleConfirm = async () => {
    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    try {
      await onConfirm(value);
    } catch (error) {
      console.error("Errore durante la conferma:", error);
    }
  };

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    if (error) {
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="input-value" className="text-sm font-medium">
              {label}
            </label>
            <input
              id="input-value"
              type={inputType}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={placeholder}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={loading || !value.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Conferma
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};