import React, { useState } from 'react';
import WaiterPanel from '@/components/waiter/WaiterPanel';
import RestaurantMap from '@/components/dashboard/RestaurantMap';
import AppLayout from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function WaiterPage() {
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  
  if (!user) return null;

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-slate-950">
        <section className="flex flex-col overflow-hidden h-full">
          {!selectedTable ? (
            <RestaurantMap onOrderEntry={(tableNum) => setSelectedTable(tableNum)} />
          ) : (
            <>
              <div className="px-3 py-2 border-b border-slate-700/30 bg-slate-900/50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold text-white">
                    📝
                  </div>
                  <span className="font-bold text-sm">Order Entry</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-bold border border-slate-700">
                    Table {selectedTable}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
                >
                  Back to Map
                </button>
              </div>
              <WaiterPanel
                waiterId={user.id}
                waiterName={user.fullName || user.username}
                accentColor="blue"
                accentGradient="from-blue-500 to-blue-700"
                prefillTableNumber={selectedTable}
                onClose={() => setSelectedTable(null)}
              />
            </>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
