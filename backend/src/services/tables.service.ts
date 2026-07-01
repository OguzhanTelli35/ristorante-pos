import { getDatabase } from '../config/database.js';
import type { TableAccount, Order, OrderItem, OrderItemStatus, StationDestination } from '@ristorante/shared';
import { NotFoundError } from '../middleware/errorHandler.js';

// ── Row interfaces ──

interface TableAccountRow {
  id: string;
  table_number: number;
  paid: number;
  closed: number;
  opened_at: string;
  closed_at: string | null;
}

interface OrderRow {
  id: string;
  display_id: string;
  table_account_id: string;
  table_number: number;
  waiter_id: string;
  waiter_name: string;
  note: string;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  emoji: string;
  price: number;
  destination: string;
  ingredients: string;
  default_ingredients: string;
  note: string;
  status: string;
}

function mapOrderItemRow(row: OrderItemRow): OrderItem {
  return {
    instanceId: row.id,
    orderId: row.order_id,
    menuItemId: row.menu_item_id,
    name: row.name,
    emoji: row.emoji,
    price: row.price,
    destination: row.destination as StationDestination,
    ingredients: JSON.parse(row.ingredients),
    defaultIngredients: JSON.parse(row.default_ingredients),
    note: row.note,
    status: row.status as OrderItemStatus,
  };
}

function mapOrderRow(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    displayId: row.display_id,
    tableNumber: row.table_number,
    tableAccountId: row.table_account_id,
    items,
    note: row.note,
    waiterId: row.waiter_id,
    waiterName: row.waiter_name,
    createdAt: row.created_at,
  };
}

function mapAccountRow(row: TableAccountRow, orders?: Order[]): TableAccount {
  const orderIds = orders?.map((o) => o.id) ?? [];
  return {
    id: row.id,
    tableNumber: row.table_number,
    orderIds,
    orders,
    paid: row.paid === 1,
    closed: row.closed === 1,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
  };
}

// ── Service Functions ──

export function getOpenTableAccounts(): TableAccount[] {
  const db = getDatabase();

  const accountRows = db
    .prepare('SELECT * FROM table_accounts WHERE closed = 0 ORDER BY table_number ASC')
    .all() as TableAccountRow[];

  return accountRows.map((accRow) => {
    const orderRows = db
      .prepare('SELECT * FROM orders WHERE table_account_id = ? ORDER BY created_at ASC')
      .all(accRow.id) as OrderRow[];

    const orders = orderRows.map((orderRow) => {
      const itemRows = db
        .prepare('SELECT * FROM order_items WHERE order_id = ?')
        .all(orderRow.id) as OrderItemRow[];
      return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
    });

    return mapAccountRow(accRow, orders);
  });
}

export function getTableAccount(tableNumber: number): TableAccount {
  const db = getDatabase();

  const accRow = db
    .prepare('SELECT * FROM table_accounts WHERE table_number = ? AND closed = 0')
    .get(tableNumber) as TableAccountRow | undefined;

  if (!accRow) {
    throw new NotFoundError('Table account', String(tableNumber));
  }

  const orderRows = db
    .prepare('SELECT * FROM orders WHERE table_account_id = ? ORDER BY created_at ASC')
    .all(accRow.id) as OrderRow[];

  const orders = orderRows.map((orderRow) => {
    const itemRows = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(orderRow.id) as OrderItemRow[];
    return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
  });

  return mapAccountRow(accRow, orders);
}

export function markTablePaid(tableNumber: number): TableAccount {
  const db = getDatabase();

  const accRow = db
    .prepare('SELECT * FROM table_accounts WHERE table_number = ? AND closed = 0')
    .get(tableNumber) as TableAccountRow | undefined;

  if (!accRow) {
    throw new NotFoundError('Table account', String(tableNumber));
  }

  db.prepare('UPDATE table_accounts SET paid = 1 WHERE id = ?').run(accRow.id);

  return getTableAccount(tableNumber);
}

export function closeTable(tableNumber: number): TableAccount {
  const db = getDatabase();

  const accRow = db
    .prepare('SELECT * FROM table_accounts WHERE table_number = ? AND closed = 0')
    .get(tableNumber) as TableAccountRow | undefined;

  if (!accRow) {
    throw new NotFoundError('Table account', String(tableNumber));
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE table_accounts SET closed = 1, closed_at = ? WHERE id = ?').run(now, accRow.id);

  // Return the closed account
  const closedRow = db.prepare('SELECT * FROM table_accounts WHERE id = ?').get(accRow.id) as TableAccountRow;

  const orderRows = db
    .prepare('SELECT * FROM orders WHERE table_account_id = ?')
    .all(accRow.id) as OrderRow[];

  const orders = orderRows.map((orderRow) => {
    const itemRows = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(orderRow.id) as OrderItemRow[];
    return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
  });

  return mapAccountRow(closedRow, orders);
}
