import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../api/client';

export interface User {
  user_id: number;
  user_name: string;
  user_email_id: string;
  role: 'user' | 'admin';
}

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (user_email_id: string, password: string) => Promise<void>;
  register: (
    user_name: string,
    user_email_id: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const save = (data: { user: User; token: string }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (user_email_id: string, password: string) => {
    const res = await api.post('/auth/login', { user_email_id, password });
    save(res.data.data);
  };

  const register = async (
    user_name: string,
    user_email_id: string,
    password: string,
    role: string
  ) => {
    const res = await api.post('/auth/register', {
      user_name,
      user_email_id,
      password,
      role,
    });
    save(res.data.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    isLoggedIn: user !== null,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return ctx;
};
