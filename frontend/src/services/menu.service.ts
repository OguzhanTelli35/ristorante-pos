import api from './api';
import type { MenuCategory, ApiResponse } from '@ristorante/shared';

export async function getMenu(): Promise<MenuCategory[]> {
  const res = await api.get<ApiResponse<MenuCategory[]>>('/menu');
  return res.data.data;
}
