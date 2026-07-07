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
  });

  seedAll();
  console.log('✓ Database seeded with menu data and default users');
}
