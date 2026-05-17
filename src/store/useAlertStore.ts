import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface AlertState {
  isOpen: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: 'primary' | 'danger' | 'accent';
  resolvePromise?: (value: boolean) => void;
  
  // Toast State
  isToastOpen: boolean;
  toastMessage: string;
  toastType: ToastType;
  toastDuration: number;

  // Actions
  showAlert: (options: {
    title: string;
    message: string;
    type?: AlertType;
    confirmLabel?: string;
    confirmVariant?: 'primary' | 'danger' | 'accent';
  }) => void;
  
  showConfirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmVariant?: 'primary' | 'danger' | 'accent';
  }) => Promise<boolean>;
  
  closeAlert: (value: boolean) => void;

  showToast: (options: {
    message: string;
    type?: ToastType;
    duration?: number;
  }) => void;

  closeToast: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  confirmLabel: '확인',
  cancelLabel: '취소',
  resolvePromise: undefined,

  isToastOpen: false,
  toastMessage: '',
  toastType: 'info',
  toastDuration: 3000,

  showAlert: ({ title, message, type = 'info', confirmLabel = '확인', confirmVariant = 'primary' }) => {
    set({
      isOpen: true,
      type,
      title,
      message,
      confirmLabel,
      confirmVariant,
      cancelLabel: '',
      resolvePromise: undefined,
    });
  },

  showConfirm: ({ title, message, confirmLabel = '확인', cancelLabel = '취소', confirmVariant = 'primary' }) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmLabel,
        cancelLabel,
        confirmVariant,
        resolvePromise: resolve,
      });
    });
  },

  closeAlert: (value: boolean) => {
    const { resolvePromise } = get();
    if (resolvePromise) {
      resolvePromise(value);
    }
    set({ isOpen: false, resolvePromise: undefined });
  },

  showToast: ({ message, type = 'info', duration = 3000 }) => {
    set({
      isToastOpen: true,
      toastMessage: message,
      toastType: type,
      toastDuration: duration,
    });
  },

  closeToast: () => {
    set({ isToastOpen: false });
  },
}));
