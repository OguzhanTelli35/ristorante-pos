import { MAX_TABLE_NUMBER, MIN_TABLE_NUMBER, ORDER_ITEM_STATUSES } from '../constants';
import type { CreateOrderRequest, CreateOrderItemRequest, OrderItemStatus } from '../types';
import { MENU_MAP } from '../constants/menu';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate a table number.
 */
export function validateTableNumber(tableNumber: number): ValidationError | null {
  if (!Number.isInteger(tableNumber)) {
    return { field: 'tableNumber', message: 'Table number must be an integer' };
  }
  if (tableNumber < MIN_TABLE_NUMBER || tableNumber > MAX_TABLE_NUMBER) {
    return {
      field: 'tableNumber',
      message: `Table number must be between ${MIN_TABLE_NUMBER} and ${MAX_TABLE_NUMBER}`,
    };
  }
  return null;
}

/**
 * Validate an order item status value.
 */
export function validateOrderItemStatus(
  status: string,
): status is OrderItemStatus {
  return (ORDER_ITEM_STATUSES as readonly string[]).includes(status);
}

/**
 * Validate order items.
 */
export function validateOrderItems(
  items: CreateOrderItemRequest[],
): ValidationError | null {
  if (!Array.isArray(items) || items.length === 0) {
    return { field: 'items', message: 'At least one item is required' };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.menuItemId || !MENU_MAP.has(item.menuItemId)) {
      return {
        field: `items[${i}].menuItemId`,
        message: `Invalid menu item ID: ${item.menuItemId}`,
      };
    }
  }

  return null;
}

/**
 * Validate a full create-order request.
 */
export function validateCreateOrder(
  req: CreateOrderRequest,
): ValidationError[] {
  const errors: ValidationError[] = [];

  const tableErr = validateTableNumber(req.tableNumber);
  if (tableErr) errors.push(tableErr);

  if (!req.waiterId || req.waiterId.trim().length === 0) {
    errors.push({ field: 'waiterId', message: 'Waiter ID is required' });
  }

  if (!req.waiterName || req.waiterName.trim().length === 0) {
    errors.push({ field: 'waiterName', message: 'Waiter name is required' });
  }

  const itemErr = validateOrderItems(req.items);
  if (itemErr) errors.push(itemErr);

  return errors;
}
