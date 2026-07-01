import api from './api';
import type {
  Order,
  OrderItem,
  CreateOrderRequest,
  UpdateItemStatusRequest,
  ApiResponse,
} from '@ristorante/shared';

export async function getOrders(params?: {
  destination?: string;
  status?: string;
  table?: number;
}): Promise<Order[]> {
  const res = await api.get<ApiResponse<Order[]>>('/orders', { params });
  return res.data.data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const res = await api.get<ApiResponse<Order>>(`/orders/${orderId}`);
  return res.data.data;
}

export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const res = await api.post<ApiResponse<Order>>('/orders', data);
  return res.data.data;
}

export async function updateItemStatus(
  orderId: string,
  itemId: string,
  data: UpdateItemStatusRequest,
): Promise<OrderItem> {
  const res = await api.patch<ApiResponse<OrderItem>>(
    `/orders/${orderId}/items/${itemId}/status`,
    data,
  );
  return res.data.data;
}

export async function clearAllOrders(): Promise<void> {
  await api.delete('/orders/all');
}
