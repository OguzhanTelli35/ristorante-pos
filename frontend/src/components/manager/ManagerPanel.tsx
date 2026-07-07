import React, { useState, useMemo } from 'react';
import type { TableAccount, Order } from '@ristorante/shared';
import {
  formatCurrency,
  formatISOTimeShort,
  calculateOrderTotal,
  calculateAccountTotal,
  groupItemsByDestination,
  areAllItemsReady,
  countPendingItems,
} from '@ristorante/shared';
import { useTables, useMarkTablePaid, useCloseTable } from '@/hooks/useTables';
import Badge from '@/components/common/Badge';
import ModificationChips from '@/components/common/ModificationChips';
import SearchInput from '@/components/common/SearchInput';
import EmptyState from '@/components/common/EmptyState';
import WaiterManagement from './WaiterManagement';

export default function ManagerPanel() {
  const [search, setSearch] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<number, boolean>>({});
  const { data: accounts = [] } = useTables();
  const markPaid = useMarkTablePaid();
  const closeTable = useCloseTable();

  const toggleExpand = (tableNumber: number) => {
    setExpandedTables((prev) => ({ ...prev, [tableNumber]: !prev[tableNumber] }));
  };

  const filteredAccounts = useMemo(() => {
    if (!search.trim()) return accounts;
    return accounts.filter(
      (a) =>
        String(a.tableNumber).includes(search) ||
        a.orderIds.some((oid) => oid.includes(search.toLowerCase())),
    );
  }, [accounts, search]);

  const [activeTab, setActiveTab] = useState<'cashier' | 'staff'>('cashier');

  return (
    <section className="flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-700/30 bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white text-xs">
            💶
          </div>
          <span className="font-bold text-xs">Manager</span>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setActiveTab('cashier')}
            className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-colors ${activeTab === 'cashier' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Cashier
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-colors ${activeTab === 'staff' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Staff
          </button>
        </div>

        {activeTab === 'cashier' && (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
              {filteredAccounts.length} Open
            </span>
            <div className="flex-1">
              <SearchInput value={search} onChange={setSearch} accentColor="emerald" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'cashier' && (
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredAccounts.length === 0 ? (
          <EmptyState icon="💶" message="No open tables" />
        ) : (
          filteredAccounts.map((account) => {
            const allOrders = account.orders ?? [];
            const allItems = allOrders.flatMap((o) => o.items);
            const total = calculateAccountTotal(allOrders);
            const allReady = areAllItemsReady(allOrders);
            const pendingCount = countPendingItems(allOrders);
            const expanded = !!expandedTables[account.tableNumber];

            const borderColor = account.paid
              ? 'border-emerald-500/30 bg-emerald-900/10'
              : allReady
                ? 'border-green-500/20'
                : 'border-slate-700/40';

            return (
              <div
                key={account.id}
                className={`order-card rounded-xl bg-slate-800/50 border ${borderColor} animate-slide-in overflow-hidden`}
              >
                {/* Header Row */}
                <div
                  className="p-2.5 cursor-pointer hover:bg-slate-700/20 transition-colors"
                  onClick={() => toggleExpand(account.tableNumber)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 border border-slate-500/30 flex items-center justify-center text-sm font-extrabold text-white">
                        {account.tableNumber}
                      </div>
                      <div>
                        <div className="text-xs font-bold">Table {account.tableNumber}</div>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                          <span>
                            {allOrders.length} order{allOrders.length !== 1 ? 's' : ''}
                          </span>
                          <span>·</span>
                          <span>
                            {allItems.length} item{allItems.length !== 1 ? 's' : ''}
                          </span>
                          {pendingCount > 0 && (
                            <>
                              <span>·</span>
                              <span className="text-amber-400">{pendingCount} pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <div className="text-base font-extrabold text-white">
                          {formatCurrency(total)}
                        </div>
                        {account.paid && (
                          <span className="text-[9px] px-1.5 py-px rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/15 font-bold">
                            PAID
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-3.5 h-3.5 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expanded && (
                  <div className="border-t border-slate-700/20 animate-fade-in">
                    {allOrders.map((order) => {
                      const { kitchen: foodItems, bar: drinkItems } = groupItemsByDestination(order.items);
                      const orderTotal = calculateOrderTotal(order);

                      return (
                        <div key={order.id} className="p-2.5 border-b border-slate-700/15 last:border-b-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-[10px] text-emerald-400">
                                #{order.displayId}
                              </span>
                              <span className="text-[9px] text-slate-500">{order.waiterName}</span>
                              <span className="text-[9px] text-slate-500">
                                {formatISOTimeShort(order.createdAt)}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-300">
                              {formatCurrency(orderTotal)}
                            </span>
                          </div>

                          {/* Food items */}
                          {foodItems.length > 0 && (
                            <>
                              <div className="text-[8px] font-bold text-orange-400/50 uppercase tracking-widest mb-0.5">
                                Food
                              </div>
                              {foodItems.map((item) => (
                                <div key={item.instanceId}>
                                  <div className="flex items-center justify-between py-px text-[10px]">
                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                      <span>{item.emoji}</span>
                                      <span className="font-medium truncate">{item.name}</span>
                                      <ModificationChips item={item} />
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <Badge status={item.status} small />
                                      <span className="text-slate-500 font-semibold w-6 text-right">
                                        {formatCurrency(item.price)}
                                      </span>
                                    </div>
                                  </div>
                                  {item.note && (
                                    <div className="text-[8px] text-violet-400/60 ml-5 mb-0.5">
                                      🏷 {item.note}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </>
                          )}

                          {/* Drink items */}
                          {drinkItems.length > 0 && (
                            <>
                              <div className="text-[8px] font-bold text-cyan-400/50 uppercase tracking-widest mb-0.5 mt-1">
                                Drinks
                              </div>
                              {drinkItems.map((item) => (
                                <div key={item.instanceId}>
                                  <div className="flex items-center justify-between py-px text-[10px]">
                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                      <span>{item.emoji}</span>
                                      <span className="font-medium truncate">{item.name}</span>
                                      <ModificationChips item={item} />
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                      <Badge status={item.status} small />
                                      <span className="text-slate-500 font-semibold w-6 text-right">
                                        {formatCurrency(item.price)}
                                      </span>
                                    </div>
                                  </div>
                                  {item.note && (
                                    <div className="text-[8px] text-violet-400/60 ml-5 mb-0.5">
                                      🏷 {item.note}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </>
                          )}

                          {order.note && (
                            <div className="text-[9px] text-amber-400/60 bg-amber-500/5 rounded-md px-1.5 py-0.5 mt-1 border border-amber-500/10">
                              📝 {order.note}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Actions */}
                    <div className="p-2.5 flex gap-1.5 border-t border-slate-700/20 bg-slate-900/30">
                      {!account.paid && (
                        <button
                          onClick={() => markPaid.mutate(account.tableNumber)}
                          disabled={markPaid.isPending}
                          className={`btn-pos flex-1 py-1.5 rounded-lg text-[10px] font-bold ${
                            allReady
                              ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow shadow-emerald-500/15 hover:from-emerald-500 hover:to-green-500'
                              : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15'
                          }`}
                        >
                          💳 Mark Paid — {formatCurrency(total)}
                        </button>
                      )}
                      <button
                        onClick={() => closeTable.mutate(account.tableNumber)}
                        disabled={closeTable.isPending}
                        className={`btn-pos ${account.paid ? 'flex-1' : ''} px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/15`}
                      >
                        {account.paid ? '✓ Close Table' : '✕ Close'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      )}
      
      {activeTab === 'staff' && <WaiterManagement />}
    </section>
  );
}
