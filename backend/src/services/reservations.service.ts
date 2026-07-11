import { getDatabase } from '../config/database.js';
import { Reservation, CreateReservationRequest, UpdateReservationRequest, ReservationStatus } from '@ristorante/shared';
import { randomUUID } from 'crypto';
import { getOpenTableAccounts, transitionTableState, openTable } from './tables.service.js';

interface ReservationRow {
  id: string;
  customer_name: string;
  phone_number: string | null;
  table_number: number;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    customerName: row.customer_name,
    phoneNumber: row.phone_number ?? undefined,
    tableNumber: row.table_number,
    reservationDate: row.reservation_date,
    reservationTime: row.reservation_time,
    guestCount: row.guest_count,
    status: row.status as ReservationStatus,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ReservationsService {
  getAllReservations(): Reservation[] {
    const db = getDatabase();
    const rows = db.prepare('SELECT * FROM reservations ORDER BY reservation_date ASC, reservation_time ASC').all() as unknown as ReservationRow[];
    return rows.map(mapRowToReservation);
  }

  createReservation(data: CreateReservationRequest): Reservation {
    const db = getDatabase();
    const id = `res_${randomUUID()}`;
    const now = new Date().toISOString();
    
    db.prepare(
      `INSERT INTO reservations 
      (id, customer_name, phone_number, table_number, reservation_date, reservation_time, guest_count, status, notes, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.customerName,
      data.phoneNumber || null,
      data.tableNumber,
      data.reservationDate,
      data.reservationTime,
      data.guestCount,
      'pending',
      data.notes || null,
      now,
      now
    );

    return this.getReservation(id)!;
  }

  updateReservation(id: string, data: UpdateReservationRequest): Reservation {
    const db = getDatabase();
    const existing = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as unknown as ReservationRow | undefined;
    if (!existing) {
      throw new Error(`Reservation not found: ${id}`);
    }

    const merged = {
      customer_name: data.customerName ?? existing.customer_name,
      phone_number: data.phoneNumber !== undefined ? (data.phoneNumber || null) : existing.phone_number,
      table_number: data.tableNumber ?? existing.table_number,
      reservation_date: data.reservationDate ?? existing.reservation_date,
      reservation_time: data.reservationTime ?? existing.reservation_time,
      guest_count: data.guestCount ?? existing.guest_count,
      status: data.status ?? existing.status,
      notes: data.notes !== undefined ? (data.notes || null) : existing.notes,
      updated_at: new Date().toISOString(),
    };

    db.prepare(
      `UPDATE reservations SET 
        customer_name = ?, phone_number = ?, table_number = ?, reservation_date = ?, 
        reservation_time = ?, guest_count = ?, status = ?, notes = ?, updated_at = ? 
      WHERE id = ?`
    ).run(
      merged.customer_name, merged.phone_number, merged.table_number, merged.reservation_date,
      merged.reservation_time, merged.guest_count, merged.status, merged.notes, merged.updated_at, id
    );

    return this.getReservation(id)!;
  }

  deleteReservation(id: string): void {
    const db = getDatabase();
    db.prepare('DELETE FROM reservations WHERE id = ?').run(id);
  }

  seatGuests(id: string): Reservation {
    const reservation = this.getReservation(id);
    if (!reservation) {
      throw new Error(`Reservation not found: ${id}`);
    }

    // Mark reservation as seated
    this.updateReservation(id, { status: 'seated' });

    // Ensure the table becomes occupied in the actual restaurant map
    const activeTables = getOpenTableAccounts();
    const existingTable = activeTables.find((t: any) => t.tableNumber === reservation.tableNumber);

    if (existingTable) {
      if (existingTable.status === 'available' || existingTable.status === 'reserved') {
        transitionTableState(reservation.tableNumber, 'occupied');
      }
      // If it's already occupied/waiting_payment, leave it as is
    } else {
      // Table is not active at all, open it as occupied
      openTable({
        tableNumber: reservation.tableNumber,
        guestCount: reservation.guestCount,
        waiterId: 'u_admin', // Default to admin for reservations seated from dashboard
        customerName: reservation.customerName,
        note: reservation.notes,
        status: 'occupied'
      });
    }

    return this.getReservation(id)!;
  }

  private getReservation(id: string): Reservation | undefined {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id) as unknown as ReservationRow | undefined;
    return row ? mapRowToReservation(row) : undefined;
  }
}

export const reservationsService = new ReservationsService();
