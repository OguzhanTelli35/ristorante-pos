import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClock } from '@/hooks/useClock';
import { useTables } from '@/hooks/useTables';
import { useOrders, useClearAllOrders } from '@/hooks/useOrders';
import { useResponsive } from '@/hooks/useResponsive';

import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const clock = useClock();
  const { user, logout } = useAuth();
  const { isPhone } = useResponsive();
  const { data: tables = [] } = useTables();
  const { data: orders = [] } = useOrders();
  const clearAll = useClearAllOrders();

  const allItems = orders.flatMap((o) => o.items);
  const preparingCount = allItems.filter((i) => i.status === 'preparing').length;
  const readyCount = allItems.filter((i) => i.status === 'ready').length;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="h-12 bg-slate-900/80 border-b border-slate-700/40 flex items-center justify-between px-5 backdrop-blur-md z-50 relative flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-extrabold text-xs shadow-lg shadow-amber-500/20">
              R
            </div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Ristorante POS
            </h1>
          </button>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold">
          {!isPhone && (
            <>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-400">Tables</span>
                <span className="text-white">{tables.length}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-slate-400">Orders</span>
                <span className="text-white">{orders.length}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-slate-400">Preparing</span>
                <span className="text-amber-300">{preparingCount}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-slate-400">Ready</span>
                <span className="text-green-300">{readyCount}</span>
              </span>
              <div className="h-4 w-px bg-slate-700" />
            </>
          )}
          <span className="font-mono tabular-nums text-slate-300 w-16 text-right">{clock}</span>
          
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700">
            <span className="text-amber-400 capitalize">{user?.fullName || user?.role}</span>
            <button
              onClick={() => logout()}
              className="btn-pos px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
          
          <button
            onClick={() => clearAll.mutate()}
            disabled={clearAll.isPending}
            className="btn-pos ml-2 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-[10px] font-bold hover:bg-red-500/20"
          >
            Clear All
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
