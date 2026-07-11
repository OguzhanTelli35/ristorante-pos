import { Request, Response, NextFunction } from 'express';
import { reservationsService } from '../services/reservations.service.js';

export function getAllReservations(req: Request, res: Response, next: NextFunction): void {
  try {
    const items = reservationsService.getAllReservations();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export function createReservation(req: Request, res: Response, next: NextFunction): void {
  try {
    const { customerName, tableNumber, reservationDate, reservationTime, guestCount } = req.body;
    if (!customerName || !tableNumber || !reservationDate || !reservationTime || !guestCount) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }
    const item = reservationsService.createReservation(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export function updateReservation(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = req.params.id as string;
    const item = reservationsService.updateReservation(id, req.body);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export function deleteReservation(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = req.params.id as string;
    reservationsService.deleteReservation(id);
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
}

export function seatGuests(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = req.params.id as string;
    const item = reservationsService.seatGuests(id);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}
