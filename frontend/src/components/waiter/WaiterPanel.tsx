import React, { useState } from 'react';
import type { MenuCategory, MenuItem } from '@ristorante/shared';
import { MENU_MAP, formatCurrency } from '@ristorante/shared';
import { useOrderDraftStore } from '@/store/orderDraftStore';
import { useMenu } from '@/hooks/useMenu';
import { useCreateOrder } from '@/hooks/useOrders';
import type { CreateOrderRequest } from '@ristorante/shared';
import { useToastStore } from '@/store/toastStore';

interface WaiterPanelProps {
  waiterId: string;
  waiterName: string;
  accentColor: string;
  accentGradient: string;
}

export default function WaiterPanel({
  waiterId,
  waiterName,
  accentColor,
  accentGradient,
}: WaiterPanelProps) {
  const { data: categories = [] } = useMenu();
  const createOrder = useCreateOrder();
  const addToast = useToastStore((s) => s.addToast);

  const draft = useOrderDraftStore((s) => s.getDraft(waiterId));
  const expandedGroups = useOrderDraftStore((s) => s.expandedGroups);
  const {
    setTableNumber,
    setActiveCategory,
    setOrderNote,
    addItem,
    removeItem,
    removeIngredient,
    addIngredient,
    setItemNote,
    toggleGroup,
    getItemCount,
    getTotalItemCount,
    getDraftTotal,
    resetDraft,
  } = useOrderDraftStore();

  const totalItems = getTotalItemCount(waiterId);
  const draftTotal = getDraftTotal(waiterId);
  const activeCategory = categories.find((c) => c.id === draft.activeCategoryId) ?? categories[0];

  const [ingredientInputs, setIngredientInputs] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const tableNum = parseInt(draft.tableNumber, 10);
    if (!tableNum || tableNum < 1) {
      addToast('Enter a valid table number', 'warning');
      return;
    }
    if (totalItems === 0) {
      addToast('Add at least one item', 'warning');
      return;
    }

    const items: CreateOrderRequest['items'] = [];
    for (const [menuItemId, instances] of Object.entries(draft.items)) {
      for (const inst of instances) {
        items.push({
          menuItemId,
          ingredients: inst.ingredients,
          note: inst.note,
        });
      }
    }

    createOrder.mutate(
      {
        tableNumber: tableNum,
        waiterId,
        waiterName,
        note: draft.orderNote,
        items,
      },
      {
        onSuccess: () => resetDraft(waiterId),
      },
    );
  };

  const handleAddIngredient = (menuItemId: string, idx: number) => {
    const key = `${menuItemId}-${idx}`;
    const value = ingredientInputs[key];
    if (value?.trim()) {
      addIngredient(waiterId, menuItemId, idx, value);
      setIngredientInputs((prev) => ({ ...prev, [key]: '' }));
    }
  };

  return (
    <div className="p-2.5 space-y-2 overflow-y-auto h-full">
      {/* Table Number */}
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
          Table #
        </label>
        <input
          type="number"
          min={1}
          max={99}
          value={draft.tableNumber}
          placeholder="e.g. 5"
          onChange={(e) => setTableNumber(waiterId, e.target.value)}
          className="w-full px-2.5 py-2 rounded-xl bg-slate-800/70 border border-slate-600/30 text-white text-sm font-bold placeholder-slate-500 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/15"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {categories.map((cat) => {
          const isActive = draft.activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(waiterId, cat.id)}
              className={`cat-tab text-[10px] px-2 py-1 rounded-lg font-semibold border ${
                isActive
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                  : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          );
        })}
      </div>

      {/* Menu Items */}
      {activeCategory && (
        <div className="space-y-1">
          {activeCategory.items.map((item) => {
            const qty = getItemCount(waiterId, item.id);
            const hasQty = qty > 0;
            const groupKey = `${waiterId}_${item.id}`;
            const isExpanded = !!expandedGroups[groupKey];

            return (
              <div
                key={item.id}
                className={`rounded-xl ${
                  hasQty ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-800/40 border-slate-700/25'
                } border p-2`}
              >
                {/* Item Header */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-xs font-semibold flex-1">{item.name}</span>
                  <span
                    className={`text-[10px] font-bold ${
                      activeCategory.destination === 'kitchen' ? 'text-orange-400' : 'text-cyan-400'
                    }`}
                  >
                    {formatCurrency(item.price)}
                  </span>
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      onClick={() => removeItem(waiterId, item.id)}
                      disabled={!hasQty}
                      className={`qty-btn w-6 h-6 rounded-md bg-slate-700/60 border border-slate-600/30 text-slate-300 text-xs font-bold flex items-center justify-center hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 ${
                        !hasQty ? 'opacity-30 pointer-events-none' : ''
                      }`}
                    >
                      −
                    </button>
                    <span
                      className={`text-xs font-bold w-4 text-center tabular-nums ${
                        hasQty ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {qty}
                    </span>
                    <button
                      onClick={() => addItem(waiterId, item.id)}
                      className="qty-btn w-6 h-6 rounded-md bg-slate-700/60 border border-slate-600/30 text-slate-300 text-xs font-bold flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Customize Toggle */}
                {hasQty && (
                  <>
                    <button
                      onClick={() => toggleGroup(waiterId, item.id)}
                      className="mt-1.5 text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <svg
                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                      Customize {qty > 1 ? `(${qty} items)` : ''}
                    </button>

                    {/* Customization Panel */}
                    {isExpanded && (
                      <div className="mt-1.5 space-y-1.5 animate-fade-in">
                        {draft.items[item.id]?.map((inst, ii) => {
                          const inputKey = `${item.id}-${ii}`;
                          return (
                            <div key={ii} className="p-2 rounded-lg bg-slate-900/50 border border-slate-700/20">
                              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                {item.name} #{ii + 1}
                              </div>
                              {/* Ingredients */}
                              <div className="flex flex-wrap gap-0.5 mb-1">
                                {inst.ingredients.map((ing) => (
                                  <span
                                    key={ing}
                                    className="chip inline-flex items-center gap-0.5 px-1.5 py-px rounded-full bg-slate-700/60 border border-slate-600/30 text-[10px] text-slate-200 font-medium"
                                  >
                                    {ing}
                                    <button
                                      onClick={() => removeIngredient(waiterId, item.id, ii, ing)}
                                      className="text-red-400 hover:text-red-300 font-bold text-[10px] leading-none ml-0.5"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                              {/* Add ingredient */}
                              <div className="flex gap-1 mb-1">
                                <input
                                  type="text"
                                  placeholder="+ ingredient"
                                  value={ingredientInputs[inputKey] ?? ''}
                                  onChange={(e) =>
                                    setIngredientInputs((prev) => ({ ...prev, [inputKey]: e.target.value }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddIngredient(item.id, ii);
                                  }}
                                  className="flex-1 px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-600/20 text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/30"
                                />
                                <button
                                  onClick={() => handleAddIngredient(item.id, ii)}
                                  className="btn-pos px-1.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/20 text-blue-300 text-[10px] font-semibold hover:bg-blue-500/25"
                                >
                                  Add
                                </button>
                              </div>
                              {/* Item note */}
                              <input
                                type="text"
                                value={inst.note}
                                placeholder="Item note (vegetarian, no ice…)"
                                onChange={(e) => setItemNote(waiterId, item.id, ii, e.target.value)}
                                className="w-full px-1.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-600/20 text-[10px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/30"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Order Note */}
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
          Order Note
        </label>
        <textarea
          rows={2}
          placeholder="Birthday table, allergy warning…"
          value={draft.orderNote}
          onChange={(e) => setOrderNote(waiterId, e.target.value)}
          className="w-full px-2 py-1.5 rounded-xl bg-slate-800/70 border border-slate-600/30 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/40 resize-none"
        />
      </div>

      {/* Draft Summary */}
      {totalItems > 0 && (
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/20 p-2">
          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Order Summary
          </div>
          {Object.entries(draft.items).map(([menuItemId, instances]) => {
            const menuItem = MENU_MAP.get(menuItemId);
            if (!menuItem) return null;
            const lineTotal = menuItem.price * instances.length;
            return (
              <div key={menuItemId} className="flex items-center justify-between text-[11px] py-0.5">
                <span>
                  {menuItem.emoji} {menuItem.name} × {instances.length}
                </span>
                <span className="font-bold text-slate-300">{formatCurrency(lineTotal)}</span>
              </div>
            );
          })}
          <div className="border-t border-slate-700/30 mt-1 pt-1 flex justify-between text-xs font-bold">
            <span>Total</span>
            <span className="text-white">{formatCurrency(draftTotal)}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={createOrder.isPending}
        className={`btn-pos w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/15 flex items-center justify-center gap-1.5 ${
          totalItems > 0 ? 'animate-pulse-glow' : 'opacity-60'
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
        {createOrder.isPending ? 'SENDING...' : `SUBMIT ORDER${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
      </button>
    </div>
  );
}
