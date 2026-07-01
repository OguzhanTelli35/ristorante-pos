import { useQuery } from '@tanstack/react-query';
import { getMenu } from '@/services/menu.service';

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: getMenu,
    staleTime: 5 * 60 * 1000, // Menu rarely changes — 5 min stale time
    refetchInterval: false,   // Don't auto-poll menu
  });
}
