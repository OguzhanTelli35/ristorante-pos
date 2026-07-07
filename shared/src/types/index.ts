// ════════════════════════════════════════════════════════════
// Domain Types — Ristorante POS
// ════════════════════════════════════════════════════════════

// ── Enums & Literals ──

export type OrderItemStatus = 'pending' | 'preparing' | 'ready';

export type StationDestination = 'kitchen' | 'bar';

export type PaymentStatus = 'unpaid' | 'paid';

// ── Menu ──

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  ingredients: string[];
  categoryId: string;
  destination: StationDestination;
  sortOrder: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  emoji: string;
  destination: StationDestination;
  sortOrder: number;
  items: MenuItem[];
}

// ── Orders ──

export interface OrderItem {
  instanceId: string;
  orderId: string;
  menuItemId: string;
  name: string;
  emoji: string;
  price: number;
  destination: StationDestination;
  ingredients: string[];
  defaultIngredients: string[];
  note: string;
  status: OrderItemStatus;
}

export interface Order {
  id: string;
  displayId: string;
  tableNumber: number;
  tableAccountId: string;
  items: OrderItem[];
  note: string;
  waiterId: string;
  waiterName: string;
  createdAt: string;
}

// ── Table Accounts ──

export interface TableAccount {
  id: string;
  tableNumber: number;
  guestCount: number;
  waiterId?: string;
  customerName?: string;
  note?: string;
  status: 'available' | 'occupied' | 'waiting_payment' | 'reserved' | 'cleaning';
  orderIds: string[];
  orders?: Order[];
  paid: boolean;
  closed: boolean;
  openedAt: string;
  closedAt: string | null;
}

// ── API Request / Response Types ──

export interface OpenTableRequest {
  tableNumber: number;
  guestCount: number;
  waiterId?: string;
  customerName?: string;
  note?: string;
}

export interface CreateOrderRequest {
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  note: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  ingredients: string[];
  note: string;
}

export interface UpdateItemStatusRequest {
  status: OrderItemStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ── Station Ticket (frontend view model) ──

export interface StationTicket {
  order: Order;
  item: OrderItem;
}

// ── Stats ──

export interface DashboardStats {
  openTables: number;
  activeOrders: number;
  preparingItems: number;
  readyItems: number;
}

// ── Draft (for waiter order building) ──

export interface DraftItemInstance {
  ingredients: string[];
  note: string;
}

export interface OrderDraft {
  tableNumber: string;
  activeCategoryId: string;
  items: Record<string, DraftItemInstance[]>; // menuItemId -> instances
  orderNote: string;
}
