import api from './api';
import type { TableAccount, ApiResponse } from '@ristorante/shared';

export async function getTables(): Promise<TableAccount[]> {
  const res = await api.get<ApiResponse<TableAccount[]>>('/tables');
  return res.data.data;
}

export async function getTable(tableNumber: number): Promise<TableAccount> {
  const res = await api.get<ApiResponse<TableAccount>>(`/tables/${tableNumber}`);
  return res.data.data;
}

export async function markTablePaid(tableNumber: number): Promise<TableAccount> {
  const res = await api.post<ApiResponse<TableAccount>>(`/tables/${tableNumber}/pay`);
  return res.data.data;
}

export async function closeTable(tableNumber: number): Promise<TableAccount> {
  const res = await api.post<ApiResponse<TableAccount>>(`/tables/${tableNumber}/close`);
  return res.data.data;
}
