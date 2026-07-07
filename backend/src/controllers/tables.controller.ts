import type { Request, Response, NextFunction } from 'express';
import * as tablesService from '../services/tables.service.js';

export function getTables(_req: Request, res: Response, next: NextFunction): void {
  try {
    const accounts = tablesService.getOpenTableAccounts();
    res.json({ success: true, data: accounts });
  } catch (err) {
    next(err);
  }
}

export function openTable(req: Request, res: Response, next: NextFunction): void {
  try {
    const account = tablesService.openTable(req.body);
    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export function getTable(req: Request, res: Response, next: NextFunction): void {
  try {
    const tableNumber = parseInt(req.params.tableNumber, 10);
    const account = tablesService.getTableAccount(tableNumber);
    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export function markPaid(req: Request, res: Response, next: NextFunction): void {
  try {
    const tableNumber = parseInt(req.params.tableNumber, 10);
    const account = tablesService.markTablePaid(tableNumber);
    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}

export function closeTable(req: Request, res: Response, next: NextFunction): void {
  try {
    const tableNumber = parseInt(req.params.tableNumber, 10);
    const account = tablesService.closeTable(tableNumber);
    res.json({ success: true, data: account });
  } catch (err) {
    next(err);
  }
}
