'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Проверяем наличие токена при загрузке
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      // Загружаем информацию о пользователе
      apiClient.getProfile()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          // Если токен невалидный, очищаем состояние
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
          setUser(null);
        });
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.login(username, password);
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        setIsAuthenticated(true);
        const userData = await apiClient.getProfile();
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const success = await apiClient.register({ username, email, password });
      if (success) {
        // После успешной регистрации автоматически входим
        return await login(username, password);
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
} 