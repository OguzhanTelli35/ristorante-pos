import { Router } from 'express';
import * as controller from '../controllers/reservations.controller.js';

const router = Router();

router.get('/', controller.getAllReservations);
router.post('/', controller.createReservation);
router.put('/:id', controller.updateReservation);
router.delete('/:id', controller.deleteReservation);
router.post('/:id/seat', controller.seatGuests);

export default router;
