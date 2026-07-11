import { Router } from 'express';
import * as controller from '../controllers/inventory.controller.js';

const router = Router();

router.get('/', controller.getAllItems);
router.post('/', controller.createItem);
router.put('/:id', controller.updateItem);
router.delete('/:id', controller.deleteItem);

export default router;
