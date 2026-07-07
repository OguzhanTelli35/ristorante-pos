import React, { useState } from 'react';
import WaiterPanel from '@/components/waiter/WaiterPanel';
import StationPanel from '@/components/station/StationPanel';
import ManagerPanel from '@/components/manager/ManagerPanel';
import RestaurantMap from '@/components/dashboard/RestaurantMap';
import AppLayout from '@/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'dashboard' | 'order_entry' | 'kitchen' | 'bar' | 'inventory' | 'reservations' | 'reports' | 'settings';

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  if (!user) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', disabled: false },
    { id: 'kitchen', label: 'Kitchen Display', icon: '🔥', disabled: false },
    { id: 'bar', label: 'Bar Display', icon: '🍹', disabled: false },
    { id: 'inventory', label: 'Inventory', icon: '📦', disabled: true },
    { id: 'reservations', label: 'Reservations', icon: '📅', disabled: true },
    { id: 'reports', label: 'Reports', icon: '📈', disabled: true },
    { id: 'settings', label: 'Settings', icon: '⚙️', disabled: true },
  ];

  return (
    <AppLayout>
      <div className="h-full flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 border-r border-slate-700/50 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-700/50">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Navigation</h2>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                disabled={item.disabled}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  if (item.id === 'dashboard') setSelectedTable(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-semibold ${
                  activeTab === item.id
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : item.disabled
                    ? 'opacity-50 cursor-not-allowed text-slate-500'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.disabled && (
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full uppercase">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-slate-950 flex flex-col">
          {activeTab === 'dashboard' && (
            <div className="h-full flex flex-row overflow-hidden divide-x divide-slate-700/30">
              <div className="flex-1 overflow-hidden flex flex-col">
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
              </div>
              <div className="w-96 flex-shrink-0 bg-slate-900/30">
                <ManagerPanel />
              </div>
            </div>
          )}

          {activeTab === 'kitchen' && (
            <div className="h-full flex flex-col">
              <StationPanel
                destination="kitchen"
                title="Kitchen Display"
                icon="🔥"
                accentColor="orange"
                gradientFrom="from-orange-500"
                gradientTo="to-red-600"
              />
            </div>
          )}

          {activeTab === 'bar' && (
            <div className="h-full flex flex-col">
              <StationPanel
                destination="bar"
                title="Bar Display"
                icon="🍹"
                accentColor="cyan"
                gradientFrom="from-cyan-500"
                gradientTo="to-teal-600"
              />
            </div>
          )}

        </main>
      </div>
    </AppLayout>
  );
}
