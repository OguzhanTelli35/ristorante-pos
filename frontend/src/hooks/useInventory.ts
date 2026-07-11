import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventory.service';
import { CreateInventoryItemRequest, UpdateInventoryItemRequest } from '@ristorante/shared';
import { useToastStore } from '@/store/toastStore';

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryService.getAll,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: CreateInventoryItemRequest) => inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      addToast('Inventory item created successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to create inventory item', 'error');
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryItemRequest }) =>
      inventoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      addToast('Inventory item updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to update inventory item', 'error');
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: string) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      addToast('Inventory item deleted successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to delete inventory item', 'error');
    },
  });
}
