import { getDatabase } from '../config/database.js';
import { MENU_CATEGORIES } from '@ristorante/shared';

/**
 * Seed the database with menu data.
 * Clears existing menu data first (idempotent).
 */
export function seedDatabase(): void {
  const db = getDatabase();

  const insertCategory = db.prepare(
    `INSERT OR REPLACE INTO menu_categories (id, name, emoji, destination, sort_order) VALUES (?, ?, ?, ?, ?)`,
  );

  const insertItem = db.prepare(
    `INSERT OR REPLACE INTO menu_items (id, name, price, emoji, category_id, ingredients, destination, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const insertUser = db.prepare(
    `INSERT OR IGNORE INTO users (id, full_name, username, password, role, active) VALUES (?, ?, ?, ?, ?, ?)`
  );

  const insertInventory = db.prepare(
    `INSERT OR IGNORE INTO inventory_items (id, name, category, unit, quantity, min_stock) VALUES (?, ?, ?, ?, ?, ?)`
  );

  const insertReservation = db.prepare(
    `INSERT OR IGNORE INTO reservations (id, customer_name, phone_number, table_number, reservation_date, reservation_time, guest_count, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const seedAll = db.transaction(() => {
    // 1. Seed Categories & Items
    for (const cat of MENU_CATEGORIES) {
      insertCategory.run(cat.id, cat.name, cat.emoji, cat.destination, cat.sortOrder);

      for (const item of cat.items) {
        insertItem.run(
          item.id,
          item.name,
          item.price,
          item.emoji,
          cat.id,
          JSON.stringify(item.ingredients),
          item.destination,
          item.sortOrder,
        );
      }
    }

    // 2. Seed Default Users
    insertUser.run('u_admin', 'Administrator', 'admin', '123', 'admin', 1);
    insertUser.run('u_kitchen', 'Kitchen Staff', 'kitchen', '123', 'kitchen', 1);
    insertUser.run('u_bar', 'Bar Staff', 'bar', '123', 'bar', 1);

    // 3. Seed Default Inventory
    const defaultInventory = [
      { id: 'inv_1', name: 'Vodka', category: 'SPIRITS', unit: 'Bottle', qty: 5, min: 2 },
      { id: 'inv_2', name: 'Gin', category: 'SPIRITS', unit: 'Bottle', qty: 8, min: 3 },
      { id: 'inv_3', name: 'Rum', category: 'SPIRITS', unit: 'Bottle', qty: 4, min: 2 },
      { id: 'inv_4', name: 'Campari', category: 'SPIRITS', unit: 'Bottle', qty: 6, min: 2 },
      { id: 'inv_5', name: 'Cynar', category: 'SPIRITS', unit: 'Bottle', qty: 3, min: 1 },
      { id: 'inv_6', name: 'Vermouth', category: 'SPIRITS', unit: 'Bottle', qty: 5, min: 2 },
      { id: 'inv_7', name: 'Acqua Naturale', category: 'WATER', unit: 'Bottle', qty: 48, min: 24 },
      { id: 'inv_8', name: 'Acqua Frizzante', category: 'WATER', unit: 'Bottle', qty: 36, min: 24 },
      { id: 'inv_9', name: 'Chardonnay', category: 'WINES', unit: 'Bottle', qty: 12, min: 6 },
      { id: 'inv_10', name: 'Pinot Bianco', category: 'WINES', unit: 'Bottle', qty: 8, min: 4 },
      { id: 'inv_11', name: 'Soave', category: 'WINES', unit: 'Bottle', qty: 3, min: 4 }, // Example of low stock
      { id: 'inv_12', name: 'Pane', category: 'FOOD', unit: 'Kilogram', qty: 2.5, min: 5 }, // Example of out/low stock
      { id: 'inv_13', name: 'Sarde in Saor', category: 'FOOD', unit: 'Piece', qty: 15, min: 10 },
      { id: 'inv_14', name: 'Baccalà Mantecato', category: 'FOOD', unit: 'Kilogram', qty: 4.2, min: 2 },
      { id: 'inv_15', name: 'Tè al Limone', category: 'SOFT DRINKS', unit: 'Bottle', qty: 20, min: 12 },
      { id: 'inv_16', name: 'Tè alla Pesca', category: 'SOFT DRINKS', unit: 'Bottle', qty: 0, min: 12 }, // Example of out of stock
      { id: 'inv_17', name: 'Ichnusa', category: 'BEER (KEG)', unit: 'Keg', qty: 4, min: 2 },
      { id: 'inv_18', name: 'Bulldog', category: 'BEER (KEG)', unit: 'Keg', qty: 1, min: 2 }, // Example of low stock
      { id: 'inv_19', name: 'Affligem', category: 'BEER (KEG)', unit: 'Keg', qty: 3, min: 1 },
      { id: 'inv_20', name: 'Corona', category: 'BEER (BOTTLE)', unit: 'Bottle', qty: 48, min: 24 },
    ];

    for (const item of defaultInventory) {
      insertInventory.run(item.id, item.name, item.category, item.unit, item.qty, item.min);
    }

    // 4. Seed Default Reservations
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const fmtDate = (d: Date) => d.toISOString().split('T')[0];
    const nowISO = today.toISOString();

    insertReservation.run('res_1', 'Alice Smith', '555-0101', 12, fmtDate(today), '19:30', 2, 'confirmed', 'Anniversary', nowISO, nowISO);
    insertReservation.run('res_2', 'Bob Johnson', '555-0202', 4, fmtDate(tomorrow), '20:00', 4, 'pending', 'Window seat preferred', nowISO, nowISO);
    insertReservation.run('res_3', 'Charlie Davis', '555-0303', 7, fmtDate(nextWeek), '18:45', 3, 'confirmed', 'No allergies', nowISO, nowISO);
  });

  seedAll();
  console.log('✓ Database seeded with menu data, default users, inventory, and reservations');
}
