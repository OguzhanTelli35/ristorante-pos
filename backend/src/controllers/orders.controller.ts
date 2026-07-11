import type { Request, Response, NextFunction } from 'express';
import * as ordersService from '../services/orders.service.js';
import { validateCreateOrder, validateOrderItemStatus } from '@ristorante/shared';
import { ValidationError } from '../middleware/errorHandler.js';
import type { OrderItemStatus, StationDestination } from '@ristorante/shared';

export function getOrders(req: Request, res: Response, next: NextFunction): void {
  try {
    const { destination, status, table } = req.query;
    const orders = ordersService.getOrders({
      destination: destination as StationDestination | undefined,
      status: status as OrderItemStatus | undefined,
      tableNumber: table ? parseInt(table as string, 10) : undefined,
      openOnly: true,
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export function getOrder(req: Request, res: Response, next: NextFunction): void {
  try {
    const order = ordersService.getOrderById(req.params.id as string);
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export function createOrder(req: Request, res: Response, next: NextFunction): void {
  try {
    const errors = validateCreateOrder(req.body);
    if (errors.length > 0) {
      throw new ValidationError('Invalid order data', errors);
    }

    const order = ordersService.createOrder(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

export function updateItemStatus(req: Request, res: Response, next: NextFunction): void {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;

    if (!validateOrderItemStatus(status)) {
      throw new ValidationError(`Invalid status: ${status}. Must be one of: pending, preparing, ready`);
    }

    const item = ordersService.updateItemStatus(orderId as string, itemId as string, status);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export function clearAll(_req: Request, res: Response, next: NextFunction): void {
  try {
    ordersService.clearAllData();
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
