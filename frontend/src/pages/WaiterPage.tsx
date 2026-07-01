import React from 'react';
import WaiterPanel from '@/components/waiter/WaiterPanel';
import AppLayout from '@/layouts/AppLayout';

export default function WaiterPage() {
  return (
    <AppLayout>
      <div className="h-full grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-700/30">
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

        <section className="hidden md:flex flex-col overflow-hidden">
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
      </div>
    </AppLayout>
  );
}
