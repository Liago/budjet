import { toast, ToastT } from 'sonner';

type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'loading';
type NotificationOptions = {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
  id?: string | number;
};

class NotificationService {
  /**
   * Mostra una notifica di successo
   * @param message Il messaggio principale della notifica
   * @param options Opzioni aggiuntive per la notifica
   * @returns L'ID della notifica creata
   */
  success(message: string, options?: NotificationOptions): ToastT {
    return toast.success(message, options);
  }

  /**
   * Mostra una notifica di errore
   * @param message Il messaggio principale della notifica
   * @param options Opzioni aggiuntive per la notifica
   * @returns L'ID della notifica creata
   */
  error(message: string, options?: NotificationOptions): ToastT {
    return toast.error(message, options);
  }

  /**
   * Mostra una notifica informativa
   * @param message Il messaggio principale della notifica
   * @param options Opzioni aggiuntive per la notifica
   * @returns L'ID della notifica creata
   */
  info(message: string, options?: NotificationOptions): ToastT {
    return toast.info(message, options);
  }

  /**
   * Mostra una notifica di avviso
   * @param message Il messaggio principale della notifica
   * @param options Opzioni aggiuntive per la notifica
   * @returns L'ID della notifica creata
   */
  warning(message: string, options?: NotificationOptions): ToastT {
    return toast.warning(message, options);
  }

  /**
   * Mostra una notifica di caricamento
   * @param message Il messaggio principale della notifica
   * @param options Opzioni aggiuntive per la notifica
   * @returns L'ID della notifica creata
   */
  loading(message: string, options?: NotificationOptions): ToastT {
    return toast.loading(message, options);
  }

  /**
   * Mostra una notifica di conferma con azioni personalizzate
   * @param message Il messaggio principale della notifica
   * @param onConfirm Callback da eseguire quando l'utente conferma
   * @param onCancel Callback opzionale da eseguire quando l'utente annulla
   * @param options Opzioni aggiuntive per la notifica
   * @returns L'ID della notifica creata
   */
  confirm(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: NotificationOptions
  ): ToastT {
    return toast(message, {
      ...options,
      action: {
        label: options?.actionLabel || 'Conferma',
        onClick: onConfirm,
      },
      cancel: {
        label: 'Annulla',
        onClick: onCancel,
      },
    });
  }

  /**
   * Aggiorna una notifica esistente
   * @param id L'ID della notifica da aggiornare
   * @param message Il nuovo messaggio
   * @param type Il nuovo tipo di notifica
   */
  update(id: ToastT, message: string, type: NotificationType): void {
    toast.update(id, {
      content: message,
      style: { type },
    });
  }

  /**
   * Rimuove una notifica
   * @param id L'ID della notifica da rimuovere
   */
  dismiss(id: ToastT): void {
    toast.dismiss(id);
  }

  /**
   * Rimuove tutte le notifiche attive
   */
  dismissAll(): void {
    toast.dismiss();
  }

  /**
   * Alternativa diretta a window.confirm
   * Mostra una notifica di conferma e restituisce una Promise che si risolve con true o false
   * @param message Il messaggio di conferma
   * @param options Opzioni aggiuntive per la notifica
   */
  async confirmDialog(
    message: string,
    options?: Omit<NotificationOptions, 'actionLabel' | 'onAction'>
  ): Promise<boolean> {
    return new Promise((resolve) => {
      toast(message, {
        ...options,
        duration: Infinity,
        action: {
          label: 'Conferma',
          onClick: () => resolve(true),
        },
        cancel: {
          label: 'Annulla',
          onClick: () => resolve(false),
        },
        onDismiss: () => resolve(false),
      });
    });
  }
}

// Esportiamo una singola istanza per utilizzarla in tutta l'applicazione
export const notificationService = new NotificationService(); 