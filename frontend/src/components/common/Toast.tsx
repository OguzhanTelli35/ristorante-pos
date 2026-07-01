import React from 'react';
import { useToastStore } from '@/store/toastStore';
import type { ToastType } from '@/store/toastStore';

const typeStyles: Record<ToastType, string> = {
  success: 'from-emerald-500 to-green-600',
  info: 'from-blue-500 to-indigo-600',
  warning: 'from-amber-500 to-orange-600',
  error: 'from-red-500 to-rose-600',
};

const typeIcons: Record<ToastType, string> = {
  success: '✓',
  info: 'ℹ',
  warning: '⚠',
  error: '✕',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      id="toast-box"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${toast.exiting ? 'animate-toast-exit' : 'animate-slide-in'} pointer-events-auto px-3.5 py-2 rounded-xl bg-gradient-to-r ${typeStyles[toast.type]} border border-white/10 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 max-w-xs`}
        >
          <span>{typeIcons[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
