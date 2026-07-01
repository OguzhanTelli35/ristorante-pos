import React from 'react';

interface EmptyStateProps {
  icon: string;
  message: string;
}

export default function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-1.5 py-12">
      <span className="text-2xl opacity-25">{icon}</span>
      <span className="text-[11px] font-medium">{message}</span>
    </div>
  );
}
