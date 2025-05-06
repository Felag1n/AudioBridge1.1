'use client';

import { useState, useEffect } from 'react';
import { apiClient } from './api';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setState({ isAuthenticated: false, user: null, loading: false });
      return;
    }

    try {
      const user = await apiClient.getProfile();
      setState({ isAuthenticated: true, user, loading: false });
    } catch (error) {
      // Если токен истек, пробуем обновить
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { access_token, refresh_token } = await apiClient.refreshToken(refreshToken);
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          const user = await apiClient.getProfile();
          setState({ isAuthenticated: true, user, loading: false });
          return;
        } catch (error) {
          // Если не удалось обновить токен, выходим
          logout();
        }
      } else {
        logout();
      }
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const { access_token, refresh_token } = await apiClient.login(username, password);
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      const user = await apiClient.getProfile();
      setState({ isAuthenticated: true, user, loading: false });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: { username: string; password: string; email?: string; full_name?: string; nickname?: string }) => {
    try {
      await apiClient.register(data);
      return await login(data.username, data.password);
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setState({ isAuthenticated: false, user: null, loading: false });
  };

  return {
    ...state,
    login,
    register,
    logout,
  };
} 