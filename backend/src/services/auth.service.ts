import { getDatabase } from '../config/database.js';
import type { User, LoginRequest, CreateWaiterRequest, UpdateWaiterRequest } from '@ristorante/shared';

// Map DB row to User object
function mapUserRow(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    username: row.username as string,
    role: row.role as User['role'],
    active: Boolean(row.active),
  };
}

export function login(req: LoginRequest): User {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM users WHERE username = ? AND password = ? AND active = 1').get(req.username, req.password);
  
  if (!row) {
    throw new Error('Invalid username or password, or account is inactive.');
  }
  
  return mapUserRow(row);
}

export function getWaiters(): User[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM users WHERE role = ?').all('waiter');
  return rows.map(mapUserRow);
}

export function createWaiter(req: CreateWaiterRequest): User {
  const db = getDatabase();
  const id = 'w_' + Math.random().toString(36).slice(2, 9);
  
  try {
    db.prepare(
      'INSERT INTO users (id, full_name, username, password, role, active) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, req.fullName, req.username, req.password || '123', 'waiter', 1);
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      throw new Error('Username already exists.');
    }
    throw err;
  }
  
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return mapUserRow(row!);
}

export function updateWaiter(id: string, req: UpdateWaiterRequest): User {
  const db = getDatabase();
  
  // Build dynamic update query
  const updates: string[] = [];
  const params: any[] = [];
  
  if (req.fullName !== undefined) {
    updates.push('full_name = ?');
    params.push(req.fullName);
  }
  if (req.username !== undefined) {
    updates.push('username = ?');
    params.push(req.username);
  }
  if (req.password !== undefined) {
    updates.push('password = ?');
    params.push(req.password);
  }
  if (req.active !== undefined) {
    updates.push('active = ?');
    params.push(req.active ? 1 : 0);
  }
  
  if (updates.length > 0) {
    params.push(id);
    params.push('waiter'); // ensure only waiters can be updated this way
    
    try {
      db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ? AND role = ?`).run(...params);
    } catch (err: any) {
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        throw new Error('Username already exists.');
      }
      throw err;
    }
  }
  
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!row) {
    throw new Error('Waiter not found.');
  }
  return mapUserRow(row);
}
