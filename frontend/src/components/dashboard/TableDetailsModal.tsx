import React, { useState } from 'react';
import type { TableAccount, OpenTableRequest } from '@ristorante/shared';
import { formatCurrency } from '@ristorante/shared';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { User } from '@ristorante/shared';
import { useToastStore } from '@/store/toastStore';
import { useAuth } from '@/contexts/AuthContext';

interface TableDetailsModalProps {
  tableNumber: number;
  capacity: number;
  account?: TableAccount;
  onClose: () => void;
  onOrderEntry?: (tableNumber: number) => void;
}

export default function TableDetailsModal({
  tableNumber,
  capacity,
  account,
  onClose,
  onOrderEntry,
}: TableDetailsModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [guestCount, setGuestCount] = useState(account?.guestCount ?? 1);
  const [waiterId, setWaiterId] = useState(account?.waiterId ?? user?.id ?? '');
  const [customerName, setCustomerName] = useState(account?.customerName ?? '');
  const [note, setNote] = useState(account?.note ?? '');

  const { data: waiters = [] } = useQuery({
    queryKey: ['waiters'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: User[] }>('/auth/waiters');
      return res.data.data;
    },
  });

  const openTableMutation = useMutation({
    mutationFn: async (req: OpenTableRequest) => {
      const res = await api.post<{ success: boolean; data: TableAccount }>('/tables/open', req);
      return res.data.data;
    },
    onSuccess: () => {
      addToast(`Table ${tableNumber} opened`, 'success');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (err: any) => {
      addToast(err.message, 'error');
    },
  });

  const handleOpenTable = () => {
    openTableMutation.mutate({
      tableNumber,
      guestCount,
      waiterId,
      customerName,
      note,
    });
  };

  const isAvailable = !account;
  
  // Compute totals if occupied
  let totalItems = 0;
  let totalCost = 0;
  if (account && account.orders) {
    account.orders.forEach(order => {
      order.items.forEach(item => {
        totalItems++;
        totalCost += item.price;
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Table {tableNumber}</h2>
            <p className="text-xs text-slate-400">Capacity: {capacity} Seats</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isAvailable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
          }`}>
            {isAvailable ? 'Available' : 'Occupied'}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {isAvailable ? (
            <>
              {/* Open Table Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guests</label>
                  <input
                    type="number"
                    min="1"
                    max={capacity + 4}
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Waiter</label>
                  <select
                    value={waiterId}
                    onChange={(e) => setWaiterId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>Select a waiter...</option>
                    {waiters.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.fullName || w.username} ({w.username})
                      </option>
                    ))}
                    {!waiters.find(w => w.id === waiterId) && waiterId && (
                      <option value={waiterId}>{waiterId} (Unknown)</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Note (Optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Birthday dinner"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Occupied Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Guests</div>
                  <div className="text-white text-sm">{account.guestCount}</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Waiter</div>
                  <div className="text-white text-sm truncate">
                    {waiters.find(w => w.id === account.waiterId)?.fullName || account.waiterId || 'None'}
                  </div>
                </div>
                <div className="col-span-2 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Current Total</div>
                    <div className="text-white font-bold text-lg">{formatCurrency(totalCost)}</div>
                  </div>
                  {(account.customerName || account.note) && (
                    <div className="text-right max-w-[50%]">
                       {account.customerName && <div className="text-xs font-semibold text-slate-300 truncate">{account.customerName}</div>}
                       {account.note && <div className="text-[10px] text-slate-400 italic truncate">{account.note}</div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Order History</h3>
                {account.orders && account.orders.length > 0 ? (
                  <div className="space-y-4">
                    {account.orders.map((order, index) => {
                      const timeString = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={order.id} className="relative pl-4 border-l-2 border-slate-700">
                          {/* Timeline dot */}
                          <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500"></div>
                          
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-blue-400">{timeString}</span>
                            {order.note && <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Note: {order.note}</span>}
                          </div>
                          
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.instanceId} className="flex justify-between items-center text-sm">
                                <span className="text-slate-300 flex items-center gap-1.5">
                                  <span>{item.emoji}</span>
                                  <span>{item.name}</span>
                                  {item.note && <span className="text-[10px] text-violet-400/80 italic ml-1">({item.note})</span>}
                                </span>
                                <span className="text-slate-500 text-xs font-medium">{formatCurrency(item.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs py-4 italic">No orders yet</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-800/30 flex gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 text-sm font-bold hover:bg-slate-800 hover:text-white"
          >
            Close
          </button>
          
          {isAvailable ? (
            <button
              onClick={handleOpenTable}
              disabled={openTableMutation.isPending}
              className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/20"
            >
              {openTableMutation.isPending ? 'Opening...' : 'Open Table'}
            </button>
          ) : (
            <>
              <button
                disabled
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-500 text-xs font-bold cursor-not-allowed"
              >
                Edit Table
              </button>
              <button
                onClick={() => onOrderEntry?.(tableNumber)}
                className="flex-[2] py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20"
              >
                Add Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
