import { getDatabase } from '../config/database.js';

/**
 * Run the initial database schema migration.
 * Idempotent — uses IF NOT EXISTS.
 */
export function runMigrations(): void {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'kitchen', 'bar', 'waiter')),
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS menu_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '',
      destination TEXT NOT NULL CHECK(destination IN ('kitchen', 'bar')),
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      emoji TEXT NOT NULL DEFAULT '',
      category_id TEXT NOT NULL REFERENCES menu_categories(id),
      ingredients TEXT NOT NULL DEFAULT '[]',
      destination TEXT NOT NULL CHECK(destination IN ('kitchen', 'bar')),
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS table_accounts (
      id TEXT PRIMARY KEY,
      table_number INTEGER NOT NULL,
      guest_count INTEGER NOT NULL DEFAULT 1,
      waiter_id TEXT,
      customer_name TEXT,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      paid INTEGER NOT NULL DEFAULT 0,
      closed INTEGER NOT NULL DEFAULT 0,
      opened_at TEXT NOT NULL,
      closed_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_table_accounts_table_number
      ON table_accounts(table_number);
    CREATE INDEX IF NOT EXISTS idx_table_accounts_open
      ON table_accounts(closed) WHERE closed = 0;

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      display_id TEXT NOT NULL,
      table_account_id TEXT NOT NULL REFERENCES table_accounts(id),
      table_number INTEGER NOT NULL,
      waiter_id TEXT NOT NULL,
      waiter_name TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_orders_table_account
      ON orders(table_account_id);

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      menu_item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL,
      destination TEXT NOT NULL CHECK(destination IN ('kitchen', 'bar')),
      ingredients TEXT NOT NULL DEFAULT '[]',
      default_ingredients TEXT NOT NULL DEFAULT '[]',
      note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'ready'))
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order
      ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_status
      ON order_items(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_destination
      ON order_items(destination);

    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      min_stock REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone_number TEXT,
      table_number INTEGER NOT NULL,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      guest_count INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  console.log('✓ Database migrations complete');

  // Attempt to alter table if existing db doesn't have the new columns
  const alters = [
    "ALTER TABLE table_accounts ADD COLUMN guest_count INTEGER NOT NULL DEFAULT 1;",
    "ALTER TABLE table_accounts ADD COLUMN waiter_id TEXT;",
    "ALTER TABLE table_accounts ADD COLUMN customer_name TEXT;",
    "ALTER TABLE table_accounts ADD COLUMN note TEXT;",
    "ALTER TABLE table_accounts ADD COLUMN status TEXT NOT NULL DEFAULT 'available';"
  ];

  for (const query of alters) {
    try {
      db.exec(query);
      console.log('✓ Applied migration:', query);
    } catch (e: any) {
      // Ignore if column already exists
    }
  }
}
