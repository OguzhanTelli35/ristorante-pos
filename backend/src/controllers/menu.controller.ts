import type { Request, Response, NextFunction } from 'express';
import * as menuService from '../services/menu.service.js';

export function getMenu(_req: Request, res: Response, next: NextFunction): void {
  try {
    const categories = menuService.getAllMenuCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}
