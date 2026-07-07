import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', authController.login);
router.get('/waiters', authController.getWaiters);
router.post('/waiters', authController.createWaiter);
router.patch('/waiters/:id', authController.updateWaiter);

export default router;
