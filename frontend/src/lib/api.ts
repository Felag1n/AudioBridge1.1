'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  auth: {
    register: `${API_BASE_URL}/register`,
    login: `${API_BASE_URL}/login`,
    refreshToken: `${API_BASE_URL}/refresh-token`,
  },
  profile: {
    getMe: `${API_BASE_URL}/users/me`,
    updateMe: `${API_BASE_URL}/users/me`,
    uploadAvatar: `${API_BASE_URL}/users/me/avatar`,
    getStats: `${API_BASE_URL}/users/me/stats`,
  },
  tracks: {
    upload: `${API_BASE_URL}/tracks/upload`,
    list: `${API_BASE_URL}/tracks`,
    delete: (id: string) => `${API_BASE_URL}/tracks/${id}`,
    like: (id: string) => `${API_BASE_URL}/tracks/${id}/like`,
    unlike: (id: string) => `${API_BASE_URL}/tracks/${id}/like`,
    liked: `${API_BASE_URL}/tracks/liked`,
    play: (id: string) => `${API_BASE_URL}/tracks/${id}/play`,
  },
};

// Типы для API
export interface User {
  username: string;
  email?: string;
  full_name?: string;
  nickname?: string;
  avatar_path?: string;
}

export interface Track {
  id: string;
  name: string;
  owner_username: string;
  created_at: string;
  cover_path?: string;
  file_path: string;
  plays: number;
  duration?: string;
  likes_count: number;
  is_liked: boolean;
}

export interface UserStats {
  total_tracks: number;
  total_plays: number;
  total_likes: number;
}

// Функция для создания заголовков с токеном
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Базовые функции для работы с API
export const apiClient = {
  // Аутентификация
  register: async (data: { username: string; password: string; email?: string; full_name?: string; nickname?: string }) => {
    const response = await fetch(api.auth.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await fetch(api.auth.login, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  refreshToken: async (refreshToken: string) => {
    const response = await fetch(api.auth.refreshToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return response.json();
  },

  // Профиль
  getProfile: async () => {
    const response = await fetch(api.profile.getMe, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await fetch(api.profile.updateMe, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(api.profile.uploadAvatar, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeaders().Authorization,
      },
      body: formData,
    });
    return response.json();
  },

  getStats: async () => {
    const response = await fetch(api.profile.getStats, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Треки
  uploadTrack: async (file: File, cover: File | null, name: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (cover) {
      formData.append('cover', cover);
    }
    formData.append('name', name);
    
    const response = await fetch(api.tracks.upload, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeaders().Authorization,
      },
      body: formData,
    });
    return response.json();
  },

  getTracks: async () => {
    const response = await fetch(api.tracks.list, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tracks');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  deleteTrack: async (id: string) => {
    const response = await fetch(api.tracks.delete(id), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  likeTrack: async (id: string) => {
    const response = await fetch(api.tracks.like(id), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  unlikeTrack: async (id: string) => {
    const response = await fetch(api.tracks.unlike(id), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  getLikedTracks: async () => {
    const response = await fetch(api.tracks.liked, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  incrementPlayCount: async (id: string) => {
    const response = await fetch(api.tracks.play(id), {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
}; 