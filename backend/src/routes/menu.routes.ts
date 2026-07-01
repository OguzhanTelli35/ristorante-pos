import { Router } from 'express';
import * as menuController from '../controllers/menu.controller.js';

const router = Router();

router.get('/', menuController.getMenu);

export default router;
