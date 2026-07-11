import { getDatabase } from '../config/database.js';
import { InventoryItem } from '@ristorante/shared';
import { randomUUID } from 'crypto';

interface InventoryItemRow {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  min_stock: number;
}

function mapRowToItem(row: InventoryItemRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    quantity: row.quantity,
    minStock: row.min_stock,
  };
}

export class InventoryService {
  getAllItems(): InventoryItem[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM inventory_items ORDER BY category, name').all() as unknown as InventoryItemRow[];
    return rows.map(mapRowToItem);
  }

  createItem(data: Omit<InventoryItem, 'id'>): InventoryItem {
    const db = getDatabase();
    const id = `inv_${randomUUID()}`;
    
    db.prepare(
      'INSERT INTO inventory_items (id, name, category, unit, quantity, min_stock) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, data.name, data.category, data.unit, data.quantity, data.minStock);

    return { id, ...data };
  }

  updateItem(id: string, data: Partial<Omit<InventoryItem, 'id'>>): InventoryItem {
    const db = getDatabase();
    
    // Get existing to merge
    const existing = db.prepare('SELECT * FROM inventory_items WHERE id = ?').get(id) as unknown as InventoryItemRow | undefined;
    if (!existing) {
      throw new Error(`Inventory item not found: ${id}`);
    }

    const merged = {
      name: data.name ?? existing.name,
      category: data.category ?? existing.category,
      unit: data.unit ?? existing.unit,
      quantity: data.quantity ?? existing.quantity,
      minStock: data.minStock ?? existing.min_stock,
    };

    db.prepare(
      'UPDATE inventory_items SET name = ?, category = ?, unit = ?, quantity = ?, min_stock = ? WHERE id = ?'
    ).run(merged.name, merged.category, merged.unit, merged.quantity, merged.minStock, id);

    return { id, ...merged };
  }

  deleteItem(id: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM inventory_items WHERE id = ?').run(id);
  }
}

export const inventoryService = new InventoryService();
