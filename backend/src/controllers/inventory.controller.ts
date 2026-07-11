import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service.js';

export function getAllItems(req: Request, res: Response, next: NextFunction): void {
  try {
    const items = inventoryService.getAllItems();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export function createItem(req: Request, res: Response, next: NextFunction): void {
  try {
    const { name, category, unit, quantity, minStock } = req.body;
    if (!name || !category || !unit || quantity === undefined || minStock === undefined) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const item = inventoryService.createItem({ name, category, unit, quantity, minStock });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export function updateItem(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = req.params.id as string;
    const item = inventoryService.updateItem(id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export function deleteItem(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = req.params.id as string;
    inventoryService.deleteItem(id);
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
}
