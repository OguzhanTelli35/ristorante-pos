import { ORDER_ID_PAD_LENGTH } from '../constants';

/**
 * Format a Date to HH:MM:SS (24-hour).
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format a Date to HH:MM (24-hour).
 */
export function formatTimeShort(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format an ISO date string to HH:MM.
 */
export function formatISOTimeShort(isoString: string): string {
  return formatTimeShort(new Date(isoString));
}

/**
 * Format a price with currency symbol.
 */
export function formatCurrency(amount: number, symbol = '€'): string {
  const formatted = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
  return `${formatted}${symbol}`;
}

/**
 * Pad an order sequence number to a display ID (e.g. "0001").
 */
export function padOrderId(seq: number): string {
  return String(seq).padStart(ORDER_ID_PAD_LENGTH, '0');
}

/**
 * Escape HTML entities to prevent XSS.
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char] ?? char);
}
