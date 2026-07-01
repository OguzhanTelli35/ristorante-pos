import { create } from 'zustand';
import type { OrderDraft, DraftItemInstance } from '@ristorante/shared';
import { MENU_CATEGORIES, MENU_MAP } from '@ristorante/shared';

interface OrderDraftStore {
  drafts: Record<string, OrderDraft>;
  expandedGroups: Record<string, boolean>;

  getDraft: (waiterId: string) => OrderDraft;
  resetDraft: (waiterId: string) => void;
  setTableNumber: (waiterId: string, tableNumber: string) => void;
  setActiveCategory: (waiterId: string, categoryId: string) => void;
  setOrderNote: (waiterId: string, note: string) => void;
  addItem: (waiterId: string, menuItemId: string) => void;
  removeItem: (waiterId: string, menuItemId: string) => void;
  removeIngredient: (waiterId: string, menuItemId: string, instanceIdx: number, ingredient: string) => void;
  addIngredient: (waiterId: string, menuItemId: string, instanceIdx: number, ingredient: string) => void;
  setItemNote: (waiterId: string, menuItemId: string, instanceIdx: number, note: string) => void;
  toggleGroup: (waiterId: string, menuItemId: string) => void;
  getItemCount: (waiterId: string, menuItemId: string) => number;
  getTotalItemCount: (waiterId: string) => number;
  getDraftTotal: (waiterId: string) => number;
}

const EMPTY_DRAFT: OrderDraft = {
  tableNumber: '',
  activeCategoryId: MENU_CATEGORIES[0]?.id ?? 'food',
  items: {},
  orderNote: '',
};

function createEmptyDraft(): OrderDraft {
  return JSON.parse(JSON.stringify(EMPTY_DRAFT));
}

export const useOrderDraftStore = create<OrderDraftStore>((set, get) => ({
  drafts: {},
  expandedGroups: {},

  getDraft: (waiterId) => {
    return get().drafts[waiterId] ?? EMPTY_DRAFT;
  },

  resetDraft: (waiterId) => {
    set((state) => ({
      drafts: { ...state.drafts, [waiterId]: createEmptyDraft() },
      expandedGroups: Object.fromEntries(
        Object.entries(state.expandedGroups).filter(([key]) => !key.startsWith(waiterId + '_')),
      ),
    }));
  },

  setTableNumber: (waiterId, tableNumber) => {
    set((state) => {
      const draft = state.drafts[waiterId] ?? createEmptyDraft();
      return {
        drafts: { ...state.drafts, [waiterId]: { ...draft, tableNumber } },
      };
    });
  },

  setActiveCategory: (waiterId, categoryId) => {
    set((state) => {
      const draft = state.drafts[waiterId] ?? createEmptyDraft();
      return {
        drafts: { ...state.drafts, [waiterId]: { ...draft, activeCategoryId: categoryId } },
      };
    });
  },

  setOrderNote: (waiterId, note) => {
    set((state) => {
      const draft = state.drafts[waiterId] ?? createEmptyDraft();
      return {
        drafts: { ...state.drafts, [waiterId]: { ...draft, orderNote: note } },
      };
    });
  },

  addItem: (waiterId, menuItemId) => {
    const menuItem = MENU_MAP.get(menuItemId);
    if (!menuItem) return;

    set((state) => {
      const draft = state.drafts[waiterId] ?? createEmptyDraft();
      const existingInstances = draft.items[menuItemId] ?? [];
      const newInstance: DraftItemInstance = {
        ingredients: [...menuItem.ingredients],
        note: '',
      };
      return {
        drafts: {
          ...state.drafts,
          [waiterId]: {
            ...draft,
            items: {
              ...draft.items,
              [menuItemId]: [...existingInstances, newInstance],
            },
          },
        },
      };
    });
  },

  removeItem: (waiterId, menuItemId) => {
    set((state) => {
      const draft = state.drafts[waiterId] ?? createEmptyDraft();
      const existing = draft.items[menuItemId];
      if (!existing || existing.length === 0) return state;

      const newInstances = existing.slice(0, -1);
      const newItems = { ...draft.items };
      if (newInstances.length === 0) {
        delete newItems[menuItemId];
      } else {
        newItems[menuItemId] = newInstances;
      }

      return {
        drafts: {
          ...state.drafts,
          [waiterId]: { ...draft, items: newItems },
        },
      };
    });
  },

  removeIngredient: (waiterId, menuItemId, instanceIdx, ingredient) => {
    set((state) => {
      const draft = state.drafts[waiterId] ?? createEmptyDraft();
      const instances = draft.items[menuItemId];
      if (!instances?.[instanceIdx]) return state;

      const newInstances = instances.map((inst, idx) =>
        idx === instanceIdx
          ? { ...inst, ingredients: inst.ingredients.filter((i) => i !== ingredient) }
          : inst,
      );

      return {
        drafts: {
          ...state.drafts,
          [waiterId]: {
            ...draft,
            items: { ...draft.items, [menuItemId]: newInstances },
          },
        },
      };
    });
  },

  addIngredient: (waiterId, menuItemId, instanceIdx, ingredient) => {
    if (!ingredient.trim()) return;
    set((state) => {
      const draft = state.drafts[waiterId] ?? createEmptyDraft();
      const instances = draft.items[menuItemId];
      if (!instances?.[instanceIdx]) return state;

      const newInstances = instances.map((inst, idx) =>
        idx === instanceIdx
          ? { ...inst, ingredients: [...inst.ingredients, ingredient.trim()] }
          : inst,
      );

      return {
        drafts: {
          ...state.drafts,
          [waiterId]: {
            ...draft,
            items: { ...draft.items, [menuItemId]: newInstances },
          },
        },
      };
    });
  },

  setItemNote: (waiterId, menuItemId, instanceIdx, note) => {
    set((state) => {
      const draft = state.drafts[waiterId] ?? createEmptyDraft();
      const instances = draft.items[menuItemId];
      if (!instances?.[instanceIdx]) return state;

      const newInstances = instances.map((inst, idx) =>
        idx === instanceIdx ? { ...inst, note } : inst,
      );

      return {
        drafts: {
          ...state.drafts,
          [waiterId]: {
            ...draft,
            items: { ...draft.items, [menuItemId]: newInstances },
          },
        },
      };
    });
  },

  toggleGroup: (waiterId, menuItemId) => {
    const key = `${waiterId}_${menuItemId}`;
    set((state) => ({
      expandedGroups: {
        ...state.expandedGroups,
        [key]: !state.expandedGroups[key],
      },
    }));
  },

  getItemCount: (waiterId, menuItemId) => {
    const draft = get().drafts[waiterId];
    return draft?.items[menuItemId]?.length ?? 0;
  },

  getTotalItemCount: (waiterId) => {
    const draft = get().drafts[waiterId];
    if (!draft) return 0;
    return Object.values(draft.items).reduce((sum, instances) => sum + instances.length, 0);
  },

  getDraftTotal: (waiterId) => {
    const draft = get().drafts[waiterId];
    if (!draft) return 0;
    return Object.entries(draft.items).reduce((sum, [menuItemId, instances]) => {
      const menuItem = MENU_MAP.get(menuItemId);
      return sum + (menuItem?.price ?? 0) * instances.length;
    }, 0);
  },
}));
