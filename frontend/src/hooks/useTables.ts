import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tablesApi from '@/services/tables.service';
import { useToastStore } from '@/store/toastStore';

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: tablesApi.getTables,
  });
}

export function useMarkTablePaid() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (tableNumber: number) => tablesApi.markTablePaid(tableNumber),
    onSuccess: (account) => {
      addToast(`Table ${account.tableNumber} marked PAID ✓`, 'success');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });
}

export function useCloseTable() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (tableNumber: number) => tablesApi.closeTable(tableNumber),
    onSuccess: (account) => {
      addToast(`Table ${account.tableNumber} closed`, 'info');
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: Error) => {
      addToast(err.message, 'error');
    },
  });
}
