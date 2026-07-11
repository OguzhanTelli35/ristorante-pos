import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsService } from '@/services/reservations.service';
import { CreateReservationRequest, UpdateReservationRequest } from '@ristorante/shared';
import { useToastStore } from '@/store/toastStore';

export function useReservations() {
  return useQuery({
    queryKey: ['reservations'],
    queryFn: reservationsService.getAll,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (data: CreateReservationRequest) => reservationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      addToast('Reservation created successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to create reservation', 'error');
    },
  });
}

export function useUpdateReservation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReservationRequest }) =>
      reservationsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      addToast('Reservation updated successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to update reservation', 'error');
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: string) => reservationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      addToast('Reservation cancelled successfully', 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to cancel reservation', 'error');
    },
  });
}

export function useSeatReservationGuests() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: string) => reservationsService.seatGuests(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      addToast(`Guests seated at Table ${data.tableNumber}`, 'success');
    },
    onError: (err: any) => {
      addToast(err.message || 'Failed to seat guests', 'error');
    },
  });
}
