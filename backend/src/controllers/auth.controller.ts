import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import type { LoginRequest, CreateWaiterRequest, UpdateWaiterRequest } from '@ristorante/shared';

export function login(req: Request<{}, {}, LoginRequest>, res: Response, next: NextFunction) {
  try {
    const user = authService.login(req.body);
    // Return user and a dummy token for now since we use local storage auth
    res.json({ success: true, data: { user, token: 'dummy-token-' + user.id } });
  } catch (error) {
    next(error);
  }
}

export function getWaiters(req: Request, res: Response, next: NextFunction) {
  try {
    const waiters = authService.getWaiters();
    res.json({ success: true, data: waiters });
  } catch (error) {
    next(error);
  }
}

export function createWaiter(req: Request<{}, {}, CreateWaiterRequest>, res: Response, next: NextFunction) {
  try {
    const waiter = authService.createWaiter(req.body);
    res.json({ success: true, data: waiter });
  } catch (error) {
    next(error);
  }
}

export function updateWaiter(req: Request<{ id: string }, {}, UpdateWaiterRequest>, res: Response, next: NextFunction) {
  try {
    const waiter = authService.updateWaiter(req.params.id, req.body);
    res.json({ success: true, data: waiter });
  } catch (error) {
    next(error);
  }
}
