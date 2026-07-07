import React from 'react';
import WaiterPanel from '@/components/waiter/WaiterPanel';
import StationPanel from '@/components/station/StationPanel';
import ManagerPanel from '@/components/manager/ManagerPanel';
import AppLayout from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <AppLayout>
      <div className="h-full grid grid-cols-4 divide-x divide-slate-700/30">
        {/* Order Entry */}
        <section className="flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700/30 bg-slate-900/50 flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[9px] font-bold text-white">
              📝
            </div>
            <span className="font-bold text-xs">Order Entry</span>
          </div>
          <WaiterPanel
            waiterId={user.id}
            waiterName={user.fullName || user.username}
            accentColor="blue"
            accentGradient="from-blue-500 to-blue-700"
          />
        </section>

        {/* Kitchen */}
        <StationPanel
          destination="kitchen"
          title="Kitchen Display"
          icon="🔥"
          accentColor="orange"
          gradientFrom="from-orange-500"
          gradientTo="to-red-600"
        />

        {/* Bar */}
        <StationPanel
          destination="bar"
          title="Bar Display"
          icon="🍹"
          accentColor="cyan"
          gradientFrom="from-cyan-500"
          gradientTo="to-teal-600"
        />

        {/* Manager / Cashier */}
        <ManagerPanel />
      </div>
    </AppLayout>
  );
}
