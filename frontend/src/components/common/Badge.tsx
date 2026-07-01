import React from 'react';
import type { OrderItemStatus } from '@ristorante/shared';

interface BadgeProps {
  status: OrderItemStatus;
  small?: boolean;
}

const statusStyles: Record<OrderItemStatus, { bg: string; dot: string }> = {
  pending: {
    bg: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
    dot: 'bg-slate-400',
  },
  preparing: {
    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    dot: 'bg-amber-400 animate-pulse',
  },
  ready: {
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
};

export default function Badge({ status, small }: BadgeProps) {
  const styles = statusStyles[status];
  const sizeClass = small ? 'text-[9px] px-1 py-px' : 'text-[10px] px-1.5 py-0.5';
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1 ${sizeClass} rounded-full border ${styles.bg} font-semibold`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {label}
    </span>
  );
}
