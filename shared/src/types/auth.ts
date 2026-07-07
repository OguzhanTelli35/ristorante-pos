export type UserRole = 'admin' | 'kitchen' | 'bar' | 'waiter';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string; // Optional for safety when sending to client
  role: UserRole;
  active: boolean;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface CreateWaiterRequest {
  fullName: string;
  username: string;
  password?: string;
}

export interface UpdateWaiterRequest {
  fullName?: string;
  username?: string;
  password?: string;
  active?: boolean;
}
