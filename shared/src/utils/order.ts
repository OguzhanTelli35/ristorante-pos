import type { Order, OrderItem, TableAccount } from '../types';

/**
 * Calculate the total price of a single order.
 */
export function calculateOrderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Calculate the total price across all orders in a table account.
 */
export function calculateAccountTotal(orders: Order[]): number {
  return orders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
}

/**
 * Get modification chips — added and removed ingredients vs. defaults.
 */
export function getIngredientModifications(item: OrderItem): {
  added: string[];
  removed: string[];
} {
  const added = item.ingredients.filter(
    (ing) => !item.defaultIngredients.includes(ing),
  );
  const removed = item.defaultIngredients.filter(
    (ing) => !item.ingredients.includes(ing),
  );
  return { added, removed };
}

/**
 * Check whether an item has any modifications.
 */
export function hasModifications(item: OrderItem): boolean {
  const { added, removed } = getIngredientModifications(item);
  return added.length > 0 || removed.length > 0;
}

/**
 * Group order items by their destination station.
 */
export function groupItemsByDestination(items: OrderItem[]): {
  kitchen: OrderItem[];
  bar: OrderItem[];
} {
  return {
    kitchen: items.filter((item) => item.destination === 'kitchen'),
    bar: items.filter((item) => item.destination === 'bar'),
  };
}

/**
 * Count items by status across a list of orders.
 */
export function countItemsByStatus(orders: Order[]): {
  pending: number;
  preparing: number;
  ready: number;
} {
  const allItems = orders.flatMap((o) => o.items);
  return {
    pending: allItems.filter((i) => i.status === 'pending').length,
    preparing: allItems.filter((i) => i.status === 'preparing').length,
    ready: allItems.filter((i) => i.status === 'ready').length,
  };
}

/**
 * Check if all items in a table account are ready.
 */
export function areAllItemsReady(orders: Order[]): boolean {
  const allItems = orders.flatMap((o) => o.items);
  return allItems.length > 0 && allItems.every((i) => i.status === 'ready');
}

/**
 * Count pending (non-ready) items across orders.
 */
export function countPendingItems(orders: Order[]): number {
  return orders
    .flatMap((o) => o.items)
    .filter((i) => i.status !== 'ready').length;
}

/**
 * Filter table accounts to only open ones.
 */
export function getOpenAccounts(accounts: TableAccount[]): TableAccount[] {
  return accounts.filter((a) => !a.closed);
}
