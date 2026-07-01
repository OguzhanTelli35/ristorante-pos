import { Router } from 'express';
import * as ordersController from '../controllers/orders.controller.js';

const router = Router();

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrder);
router.post('/', ordersController.createOrder);
router.patch('/:orderId/items/:itemId/status', ordersController.updateItemStatus);
router.delete('/all', ordersController.clearAll);

export default router;
