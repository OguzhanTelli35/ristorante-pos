import api from './api';
import {
  InventoryItem,
  CreateInventoryItemRequest,
  UpdateInventoryItemRequest,
  ApiResponse
} from '@ristorante/shared';

export const inventoryService = {
  getAll: async (): Promise<InventoryItem[]> => {
    const res = await api.get<ApiResponse<InventoryItem[]>>('/inventory');
    return res.data.data;
  },

  create: async (data: CreateInventoryItemRequest): Promise<InventoryItem> => {
    const res = await api.post<ApiResponse<InventoryItem>>('/inventory', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateInventoryItemRequest): Promise<InventoryItem> => {
    const res = await api.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<{ id: string }>>(`/inventory/${id}`);
  }
};
