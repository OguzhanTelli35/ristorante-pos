import { getDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { padOrderId, MENU_MAP } from '@ristorante/shared';
import type {
  Order,
  OrderItem,
  CreateOrderRequest,
  OrderItemStatus,
  StationDestination,
} from '@ristorante/shared';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

// ── Row interfaces matching the SQLite schema ──

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

// ── Helpers ──

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

// ── Sequence counter for display IDs ──
let _orderSeq = 0;

function initOrderSeq(): void {
  const db = getDatabase();
  const row = db.prepare('SELECT MAX(CAST(display_id AS INTEGER)) as max_id FROM orders').get() as
    | { max_id: number | null }
    | undefined;
  _orderSeq = row?.max_id ?? 0;
}

// ── Service Functions ──

export function getOrders(filters?: {
  destination?: StationDestination;
  status?: OrderItemStatus;
  tableNumber?: number;
  openOnly?: boolean;
}): Order[] {
  const db = getDatabase();

  // Ensure sequence is initialized
  if (_orderSeq === 0) initOrderSeq();

  let query = `
    SELECT DISTINCT o.* FROM orders o
    JOIN table_accounts ta ON o.table_account_id = ta.id
  `;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.openOnly !== false) {
    conditions.push('ta.closed = 0');
  }

  if (filters?.tableNumber) {
    conditions.push('o.table_number = ?');
    params.push(filters.tableNumber);
  }

  if (filters?.destination || filters?.status) {
    query += ' JOIN order_items oi ON oi.order_id = o.id';
    if (filters.destination) {
      conditions.push('oi.destination = ?');
      params.push(filters.destination);
    }
    if (filters.status) {
      conditions.push('oi.status = ?');
      params.push(filters.status);
    }
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY o.created_at DESC';

  const orderRows = db.prepare(query).all(...params) as unknown as OrderRow[];

  return orderRows.map((orderRow) => {
    const itemRows = db
      .prepare('SELECT * FROM order_items WHERE order_id = ?')
      .all(orderRow.id) as unknown as OrderItemRow[];

    const items = itemRows.map(mapOrderItemRow);

    // If we're filtering by destination/status, only include matching items
    let filteredItems = items;
    if (filters?.destination) {
      filteredItems = filteredItems.filter((i) => i.destination === filters.destination);
    }

    return mapOrderRow(orderRow, filteredItems);
  });
}

export function getOrderById(orderId: string): Order {
  const db = getDatabase();

  const orderRow = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as
    | OrderRow
    | undefined;

  if (!orderRow) {
    throw new NotFoundError('Order', orderId);
  }

  const itemRows = db
    .prepare('SELECT * FROM order_items WHERE order_id = ?')
    .all(orderRow.id) as unknown as OrderItemRow[];

  return mapOrderRow(orderRow, itemRows.map(mapOrderItemRow));
}

export function createOrder(req: CreateOrderRequest): Order {
  const db = getDatabase();

  // Ensure sequence is initialized
  if (_orderSeq === 0) initOrderSeq();

  // Validate items exist in menu
  for (const item of req.items) {
    if (!MENU_MAP.has(item.menuItemId)) {
      throw new ValidationError(`Invalid menu item: ${item.menuItemId}`);
    }
  }

  const orderId = uuidv4();
  _orderSeq++;
  const displayId = padOrderId(_orderSeq);
  const now = new Date().toISOString();

  // Get or create table account
  let accountRow = db
    .prepare('SELECT * FROM table_accounts WHERE table_number = ? AND closed = 0')
    .get(req.tableNumber) as { id: string } | undefined;

  const tableAccountId = accountRow?.id ?? uuidv4();

  const createAll = db.transaction(() => {
    // Create table account if needed
    if (!accountRow) {
      db.prepare(
        'INSERT INTO table_accounts (id, table_number, paid, closed, opened_at) VALUES (?, ?, 0, 0, ?)',
      ).run(tableAccountId, req.tableNumber, now);
    }

    // Create order
    db.prepare(
      `INSERT INTO orders (id, display_id, table_account_id, table_number, waiter_id, waiter_name, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(orderId, displayId, tableAccountId, req.tableNumber, req.waiterId, req.waiterName, req.note || '', now);

    // Create order items
    const insertItem = db.prepare(
      `INSERT INTO order_items (id, order_id, menu_item_id, name, emoji, price, destination, ingredients, default_ingredients, note, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    );

    for (const item of req.items) {
      const menuItem = MENU_MAP.get(item.menuItemId)!;
      insertItem.run(
        uuidv4(),
        orderId,
        menuItem.id,
        menuItem.name,
        menuItem.emoji,
        menuItem.price,
        menuItem.destination,
        JSON.stringify(item.ingredients),
        JSON.stringify(menuItem.ingredients),
        item.note || '',
      );
    }
  });

  createAll();

  return getOrderById(orderId);
}

export function updateItemStatus(
  orderId: string,
  itemId: string,
  status: OrderItemStatus,
): OrderItem {
  const db = getDatabase();

  // Verify order exists
  const orderRow = db.prepare('SELECT id FROM orders WHERE id = ?').get(orderId);
  if (!orderRow) {
    throw new NotFoundError('Order', orderId);
  }

  // Verify and update item
  const itemRow = db
    .prepare('SELECT * FROM order_items WHERE id = ? AND order_id = ?')
    .get(itemId, orderId) as OrderItemRow | undefined;

  if (!itemRow) {
    throw new NotFoundError('Order item', itemId);
  }

  db.prepare('UPDATE order_items SET status = ? WHERE id = ?').run(status, itemId);

  return mapOrderItemRow({ ...itemRow, status });
}

export function clearAllData(): void {
  const db = getDatabase();
  const clearAll = db.transaction(() => {
    db.prepare('DELETE FROM order_items').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM table_accounts').run();
  });
  clearAll();
  _orderSeq = 0;
}
