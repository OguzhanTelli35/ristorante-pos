export const APP_NAME = 'Ristorante POS';

export const MAX_TABLE_NUMBER = 99;
export const MIN_TABLE_NUMBER = 1;
export const ORDER_ID_PAD_LENGTH = 4;

export const ORDER_ITEM_STATUSES = ['pending', 'preparing', 'ready'] as const;
export const STATION_DESTINATIONS = ['kitchen', 'bar'] as const;

export const API_BASE_URL = '/api';

export const TOAST_DURATION_MS = 3000;
export const CLOCK_INTERVAL_MS = 1000;

export { MENU_CATEGORIES, MENU_MAP } from './menu.js';
