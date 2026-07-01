import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ordersApi from '@/services/orders.service';
import type { CreateOrderRequest, OrderItemStatus } from '@ristorante/shared';
import { useToastStore } from '@/store/toastStore';

export function useOrders(params?: { destination?: string; status?: string; table?: number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: CreateOrderRequest) => ordersApi.createOrder(data),
    onSuccess: (order) => {
      addToast(`Order #${order.displayId} — Table ${order.tableNumber} sent!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (params: { orderId: string; itemId: string; status: OrderItemStatus }) =>
      ordersApi.updateItemStatus(params.orderId, params.itemId, { status: params.status }),
    onSuccess: (item) => {
      addToast(`${item.emoji} ${item.name} → ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`, 'info');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });
}

export function useClearAllOrders() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ordersApi.clearAllOrders,
    onSuccess: () => {
      addToast('All data cleared', 'warning');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });
}
