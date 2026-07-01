import React, { useState, useMemo } from 'react';
import type { Order, OrderItem, OrderItemStatus, StationDestination } from '@ristorante/shared';
import { formatISOTimeShort } from '@ristorante/shared';
import { useOrders, useUpdateItemStatus } from '@/hooks/useOrders';
import Badge from '@/components/common/Badge';
import ModificationChips from '@/components/common/ModificationChips';
import SearchInput from '@/components/common/SearchInput';
import EmptyState from '@/components/common/EmptyState';

interface StationPanelProps {
  destination: StationDestination;
  title: string;
  icon: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const statusOrder: Record<OrderItemStatus, number> = {
  pending: 0,
  preparing: 1,
  ready: 2,
};

const statusBtnStyles: Record<
  OrderItemStatus,
  { active: string; inactive: string }
> = {
  pending: {
    active: 'bg-slate-500 text-white',
    inactive: 'bg-slate-800 text-slate-400 hover:bg-slate-700',
  },
  preparing: {
    active: 'bg-amber-500 text-white',
    inactive: 'bg-slate-800 text-slate-400 hover:bg-amber-500/15 hover:text-amber-300',
  },
  ready: {
    active: 'bg-emerald-500 text-white',
    inactive: 'bg-slate-800 text-slate-400 hover:bg-emerald-500/15 hover:text-emerald-300',
  },
};

export default function StationPanel({
  destination,
  title,
  icon,
  accentColor,
  gradientFrom,
  gradientTo,
}: StationPanelProps) {
  const [search, setSearch] = useState('');
  const { data: orders = [] } = useOrders({ destination });
  const updateStatus = useUpdateItemStatus();

  // Build tickets: each item is a separate ticket
  const tickets = useMemo(() => {
    const result: { order: Order; item: OrderItem }[] = [];

    for (const order of orders) {
      for (const item of order.items) {
        if (item.destination === destination) {
          result.push({ order, item });
        }
      }
    }

    // Apply search filter
    const filtered = search.trim()
      ? result.filter(
          ({ order }) =>
            order.displayId.includes(search.toLowerCase()) ||
            String(order.tableNumber).includes(search),
        )
      : result;

    // Sort by status
    filtered.sort((a, b) => statusOrder[a.item.status] - statusOrder[b.item.status]);

    return filtered;
  }, [orders, search, destination]);

  return (
    <section className="flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-700/30 bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-md bg-gradient-to-br ${gradientFrom} ${gradientTo} flex items-center justify-center text-white text-xs`}
          >
            {icon}
          </div>
          <span className="font-bold text-xs">{title}</span>
          <span
            className={`ml-auto text-[10px] bg-${accentColor}-500/15 text-${accentColor}-300 px-1.5 py-0.5 rounded-full font-bold`}
          >
            {tickets.length}
          </span>
        </div>
        <div className="mt-1.5">
          <SearchInput value={search} onChange={setSearch} accentColor={accentColor} />
        </div>
      </div>

      {/* Ticket List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tickets.length === 0 ? (
          <EmptyState
            icon={icon}
            message={destination === 'kitchen' ? 'No food tickets' : 'No drink tickets'}
          />
        ) : (
          tickets.map(({ order, item }) => {
            const borderColor =
              item.status === 'ready'
                ? 'border-emerald-500/25'
                : item.status === 'preparing'
                  ? 'border-amber-500/25'
                  : 'border-slate-700/40';

            return (
              <div
                key={item.instanceId}
                className={`order-card rounded-xl bg-slate-800/50 border ${borderColor} p-2.5 animate-slide-in`}
              >
                {/* Item header */}
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{item.emoji}</span>
                    <div>
                      <div className="font-bold text-xs">{item.name}</div>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                        <span className={`font-mono font-bold text-${accentColor}-400/70`}>
                          #{order.displayId}
                        </span>
                        <span>·</span>
                        <span>
                          T<strong className="text-slate-200">{order.tableNumber}</strong>
                        </span>
                        <span>·</span>
                        <span>{formatISOTimeShort(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Badge status={item.status} />
                </div>

                {/* Modification chips */}
                <ModificationChips item={item} />

                {/* Ingredients */}
                {item.ingredients.length > 0 && (
                  <div className="text-[9px] text-slate-500 mb-1">
                    {item.ingredients.join(' · ')}
                  </div>
                )}

                {/* Item note */}
                {item.note && (
                  <div className="text-[9px] text-violet-400/80 bg-violet-500/5 rounded-md px-1.5 py-0.5 mb-1 border border-violet-500/10">
                    🏷 {item.note}
                  </div>
                )}

                {/* Order note */}
                {order.note && (
                  <div className="text-[9px] text-amber-400/70 bg-amber-500/5 rounded-md px-1.5 py-0.5 mb-1 border border-amber-500/10">
                    📝 {order.note}
                  </div>
                )}

                {/* Status Buttons */}
                <div className="flex gap-1 mt-1">
                  {(['pending', 'preparing', 'ready'] as OrderItemStatus[]).map((status) => {
                    const isActive = item.status === status;
                    const styles = statusBtnStyles[status];
                    return (
                      <button
                        key={status}
                        onClick={() =>
                          updateStatus.mutate({
                            orderId: order.id,
                            itemId: item.instanceId,
                            status,
                          })
                        }
                        className={`btn-pos text-[9px] px-1.5 py-0.5 rounded-md ${
                          isActive ? styles.active : styles.inactive
                        } font-bold border border-transparent`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
