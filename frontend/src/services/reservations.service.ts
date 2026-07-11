import api from './api';
import {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  ApiResponse
} from '@ristorante/shared';

export const reservationsService = {
  getAll: async (): Promise<Reservation[]> => {
    const res = await api.get<ApiResponse<Reservation[]>>('/reservations');
    return res.data.data;
  },

  create: async (data: CreateReservationRequest): Promise<Reservation> => {
    const res = await api.post<ApiResponse<Reservation>>('/reservations', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateReservationRequest): Promise<Reservation> => {
    const res = await api.put<ApiResponse<Reservation>>(`/reservations/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<{ id: string }>>(`/reservations/${id}`);
  },

  seatGuests: async (id: string): Promise<Reservation> => {
    const res = await api.post<ApiResponse<Reservation>>(`/reservations/${id}/seat`);
    return res.data.data;
  }
};
