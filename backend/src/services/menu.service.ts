import { getDatabase } from '../config/database.js';
import type { MenuCategory, MenuItem } from '@ristorante/shared';

interface MenuCategoryRow {
  id: string;
  name: string;
  emoji: string;
  destination: 'kitchen' | 'bar';
  sort_order: number;
}

interface MenuItemRow {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category_id: string;
  ingredients: string;
  destination: 'kitchen' | 'bar';
  sort_order: number;
}

export function getAllMenuCategories(): MenuCategory[] {
  const db = getDatabase();

  const catRows = db
    .prepare('SELECT * FROM menu_categories ORDER BY sort_order ASC')
    .all() as unknown as MenuCategoryRow[];

  const itemRows = db
    .prepare('SELECT * FROM menu_items ORDER BY sort_order ASC')
    .all() as unknown as MenuItemRow[];

  return catRows.map((cat) => ({
    id: cat.id,
    name: cat.name,
    emoji: cat.emoji,
    destination: cat.destination,
    sortOrder: cat.sort_order,
    items: itemRows
      .filter((item) => item.category_id === cat.id)
      .map(
        (item): MenuItem => ({
          id: item.id,
          name: item.name,
          price: item.price,
          emoji: item.emoji,
          categoryId: item.category_id,
          destination: item.destination,
          ingredients: JSON.parse(item.ingredients),
          sortOrder: item.sort_order,
        }),
      ),
  }));
}
