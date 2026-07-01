import { Router } from 'express';
import * as tablesController from '../controllers/tables.controller.js';

const router = Router();

router.get('/', tablesController.getTables);
router.get('/:tableNumber', tablesController.getTable);
router.post('/:tableNumber/pay', tablesController.markPaid);
router.post('/:tableNumber/close', tablesController.closeTable);

export default router;
