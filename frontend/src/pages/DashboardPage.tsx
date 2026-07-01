import React from 'react';
import WaiterPanel from '@/components/waiter/WaiterPanel';
import StationPanel from '@/components/station/StationPanel';
import ManagerPanel from '@/components/manager/ManagerPanel';
import AppLayout from '@/layouts/AppLayout';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="h-full grid grid-cols-5 divide-x divide-slate-700/30">
        {/* Waiter 1 */}
        <section className="flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700/30 bg-slate-900/50 flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[9px] font-bold text-white">
              W1
            </div>
            <span className="font-bold text-xs">Waiter 1</span>
          </div>
          <WaiterPanel
            waiterId="w1"
            waiterName="Waiter 1"
            accentColor="blue"
            accentGradient="from-blue-500 to-blue-700"
          />
        </section>

        {/* Waiter 2 */}
        <section className="flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700/30 bg-slate-900/50 flex items-center gap-2 flex-shrink-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-[9px] font-bold text-white">
              W2
            </div>
            <span className="font-bold text-xs">Waiter 2</span>
          </div>
          <WaiterPanel
            waiterId="w2"
            waiterName="Waiter 2"
            accentColor="violet"
            accentGradient="from-violet-500 to-violet-700"
          />
        </section>

        {/* Kitchen */}
        <StationPanel
          destination="kitchen"
          title="Kitchen"
          icon="🔥"
          accentColor="orange"
          gradientFrom="from-orange-500"
          gradientTo="to-red-600"
        />

        {/* Bar */}
        <StationPanel
          destination="bar"
          title="Bar"
          icon="🍹"
          accentColor="cyan"
          gradientFrom="from-cyan-500"
          gradientTo="to-teal-600"
        />

        {/* Manager */}
        <ManagerPanel />
      </div>
    </AppLayout>
  );
}
