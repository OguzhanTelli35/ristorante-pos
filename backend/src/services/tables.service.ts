import { getDatabase } from '../config/database.js';
import type { TableAccount, Order, OrderItem, OrderItemStatus, StationDestination } from '@ristorante/shared';
import { NotFoundError } from '../middleware/errorHandler.js';

// ── Row interfaces ──

interface TableAccountRow {
  id: string;
  table_number: number;
  guest_count: number;
  waiter_id: string | null;
  customer_name: string | null;
  note: string | null;
  status: string;
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
    guestCount: row.guest_count,
    waiterId: row.waiter_id || undefined,
    customerName: row.customer_name || undefined,
    note: row.note || undefined,
    status: (row.status as any) || 'available',
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
    .all() as unknown as TableAccountRow[];

  return accountRows.map((accRow) => {
    const orderRows = db
      .prepare('SELECT * FROM orders WHERE table_account_id = ? ORDER BY created_at ASC')
      .all(accRow.id) as unknown as OrderRow[];

    const orders = orderRows.map((orderRow) => {
      const itemRows = db
        .prepare('SELECT * FROM order_items WHERE order_id = ?')
        .all(orderRow.id) as unknown as OrderItemRow[];
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
    .all(accRow.id) as unknown as OrderRow[];

  const orders = orderRows.map((orderRow) => {
    const itemRows = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(orderRow.id) as unknown as OrderItemRow[];
    return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
  });

  return mapAccountRow(accRow, orders);
}

import { v4 as uuidv4 } from 'uuid';
import type { OpenTableRequest } from '@ristorante/shared';

export function openTable(req: OpenTableRequest): TableAccount {
  const db = getDatabase();

  // Archive any old available accounts to decouple lifecycle from state transitions
  db.prepare(`UPDATE table_accounts SET closed = 1, closed_at = ? WHERE table_number = ? AND status = 'available' AND closed = 0`)
    .run(new Date().toISOString(), req.tableNumber);

  // Check if already open and NOT available
  const existing = db
    .prepare('SELECT id FROM table_accounts WHERE table_number = ? AND closed = 0')
    .get(req.tableNumber);

  if (existing) {
    throw new Error(`Table ${req.tableNumber} is already open.`);
  }

  const tableAccountId = uuidv4();
  const now = new Date().toISOString();

  const initialStatus = req.status || 'occupied';

  db.prepare(
    `INSERT INTO table_accounts 
     (id, table_number, guest_count, waiter_id, customer_name, note, status, paid, closed, opened_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`
  ).run(
    tableAccountId,
    req.tableNumber,
    req.guestCount || 1,
    req.waiterId || null,
    req.customerName || null,
    req.note || null,
    initialStatus,
    now
  );

  return getTableAccount(req.tableNumber);
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

export function transitionTableState(tableNumber: number, newStatus: string): TableAccount {
  const db = getDatabase();

  const accRow = db
    .prepare('SELECT * FROM table_accounts WHERE table_number = ? AND closed = 0')
    .get(tableNumber) as TableAccountRow | undefined;

  if (!accRow) {
    throw new NotFoundError('Table account', String(tableNumber));
  }

  const validStates = ['available', 'reserved', 'occupied', 'waiting_payment', 'cleaning'];
  if (!validStates.includes(newStatus)) {
    throw new Error(`Invalid table state: '${newStatus}'.`);
  }

  db.prepare('UPDATE table_accounts SET status = ? WHERE id = ?').run(newStatus, accRow.id);

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
  const closedRow = db.prepare('SELECT * FROM table_accounts WHERE id = ?').get(accRow.id) as unknown as TableAccountRow;

  const orderRows = db
    .prepare('SELECT * FROM orders WHERE table_account_id = ?')
    .all(accRow.id) as unknown as OrderRow[];

  const orders = orderRows.map((orderRow) => {
    const itemRows = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(orderRow.id) as unknown as OrderItemRow[];
    return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
  });

  return mapAccountRow(closedRow, orders);
}
