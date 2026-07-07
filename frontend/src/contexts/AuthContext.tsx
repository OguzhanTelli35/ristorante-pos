import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest } from '@ristorante/shared';
import api from '@/services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (req: LoginRequest, rememberMe: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load user from localStorage or sessionStorage
    const storedUser = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // invalid JSON
      }
    }
    setLoading(false);
  }, []);

  const login = async (req: LoginRequest, rememberMe: boolean) => {
    setError(null);
    try {
      const res = await api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', req);
      const loggedInUser = res.data.data.user;
      setUser(loggedInUser);
      
      const storageString = JSON.stringify(loggedInUser);
      if (rememberMe) {
        localStorage.setItem('auth_user', storageString);
      } else {
        sessionStorage.setItem('auth_user', storageString);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
