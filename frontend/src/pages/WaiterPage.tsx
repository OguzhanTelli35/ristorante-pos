import React from 'react';
import WaiterPanel from '@/components/waiter/WaiterPanel';
import AppLayout from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function WaiterPage() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-slate-950">
        <section className="flex flex-col overflow-hidden h-full">
          <div className="px-3 py-2 border-b border-slate-700/30 bg-slate-900/50 flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white">
              📝
            </div>
            <span className="font-bold text-sm">Order Entry</span>
          </div>
          <WaiterPanel
            waiterId={user.id}
            waiterName={user.fullName || user.username}
            accentColor="blue"
            accentGradient="from-blue-500 to-blue-700"
          />
        </section>
      </div>
    </AppLayout>
  );
}
