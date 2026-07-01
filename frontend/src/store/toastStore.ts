import { create } from 'zustand';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  markExiting: (id: string) => void;
}

let _toastId = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  addToast: (message, type = 'success') => {
    const id = String(++_toastId);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.map((t) =>
          t.id === id ? { ...t, exiting: true } : t,
        ),
      }));
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 300);
    }, 3000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  markExiting: (id) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, exiting: true } : t,
      ),
    }));
  },
}));
