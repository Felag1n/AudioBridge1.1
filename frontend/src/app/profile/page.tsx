"use client"
import { useState, useRef, useEffect } from 'react';
import { FaUser, FaMusic, FaEdit, FaTrash, FaHeart, FaShare, FaCamera, FaPlay, FaSignOutAlt, FaPause, FaRegHeart, FaUpload } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import { SearchModal } from '@/components/SearchModal';
import PlayerBar from '@/components/PlayerBar';
import { useAudio } from '@/contexts/AudioContext';

interface Track {
  id: string;
  name: string;
  owner_username: string;
  file_path: string;
  cover_path: string | null;
  created_at: string;
  plays: number;
  duration: string | null;
  likes_count: number;
  is_liked: boolean;
}

interface UserData {
  username: string;
  email: string;
  avatar_path: string | null;
}

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  
  // Все useState хуки должны быть объявлены в начале компонента
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('/default-avatar.png');
  const [trackCover, setTrackCover] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudio();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [uploadingTrack, setUploadingTrack] = useState(false);
  const [trackName, setTrackName] = useState('');
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [trackCoverFile, setTrackCoverFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      try {
        const userData = await apiClient.getProfile();
        if (!userData) {
          throw new Error('Failed to get user data');
        }
        setUsername(userData.username || 'Мой профиль');
        setNickname(userData.nickname || `@${userData.username}`);
        setAvatar(userData.avatar_path ? `${process.env.NEXT_PUBLIC_API_URL}${userData.avatar_path}` : '/images/default-avatar.jpg');

        // Загружаем треки пользователя
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const allTracks = await response.json();
          // Фильтруем треки, оставляя только те, которые принадлежат текущему пользователю
          const userTracks = allTracks.filter((track: Track) => track.owner_username === userData.username);
          setTracks(userTracks);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        router.replace('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchTracks = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const allTracks = await response.json();
          // Фильтруем треки, принадлежащие текущему пользователю
          const userTracks = allTracks.filter((track: Track) => track.owner_username === userData?.username);
          setTracks(userTracks);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
      }
    };

    if (isAuthenticated) {
      fetchUserData();
      fetchTracks();
    }
  }, [isAuthenticated, userData?.username]);

  const handleSaveProfile = async () => {
    try {
      const updatedData = {
        username,
        nickname: nickname.replace('@', '')
      };
      await apiClient.updateProfile(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploadingAvatar(true);
        const result = await apiClient.uploadAvatar(file);
        if (result.avatar_path) {
          setAvatar(`${process.env.NEXT_PUBLIC_API_URL}${result.avatar_path}`);
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.replace('/auth/login');
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleDeleteTrack = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        setTracks(tracks.filter(track => track.id !== id));
      }
    } catch (error) {
      console.error('Error deleting track:', error);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleTrackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('audio/')) {
        setUploadError('Пожалуйста, выберите аудио файл');
        return;
      }
      setTrackFile(file);
      setUploadError(null);
    }
  };

  const handleTrackCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('image/')) {
        setUploadError('Пожалуйста, выберите изображение');
        return;
      }
      setTrackCoverFile(file);
      // Создаем превью обложки
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrackCover(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadError(null);
    }
  };

  const handleTrackUpload = async () => {
    if (!trackFile || !trackName) {
      setUploadError('Пожалуйста, укажите название и выберите файл');
      return;
    }

    try {
      setUploadingTrack(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', trackFile);
      formData.append('name', trackName);
      if (trackCoverFile) {
        formData.append('cover', trackCoverFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке трека');
      }

      const newTrack = await response.json();
      setTracks([newTrack, ...tracks]);
      setShowUploadModal(false);
      setTrackName('');
      setTrackFile(null);
      setTrackCoverFile(null);
    } catch (error) {
      console.error('Error uploading track:', error);
      setUploadError('Произошла ошибка при загрузке трека');
    } finally {
      setUploadingTrack(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: formData,
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        },
      });

      if (response.ok) {
        const newTrack = await response.json();
        setTracks([...tracks, newTrack]);
      }
    } catch (error) {
      console.error('Error uploading track:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePlayPause = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleLike = async (trackId: string) => {
    try {
      const track = tracks.find(t => t.id === trackId);
      if (!track) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/like`,
        {
          method: track.is_liked ? 'DELETE' : 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.ok) {
        setTracks(tracks.map(t => 
          t.id === trackId 
            ? { 
                ...t, 
                is_liked: !t.is_liked,
                likes_count: t.is_liked ? t.likes_count - 1 : t.likes_count + 1
              }
            : t
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleTrackClick = (trackId: string) => {
    router.push(`/track/${trackId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white">
      <Sidebar onSearchClick={handleSearchClick} />
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
      
      {/* Profile Header */}
      <div className="relative ml-64">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent h-64" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div 
                className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl overflow-hidden cursor-pointer"
                onClick={handleAvatarClick}
              >
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-white text-6xl" />
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingAvatar ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <FaCamera className="text-white text-3xl" />
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4 max-w-md mx-auto md:mx-0">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-800/50 text-4xl font-bold px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full bg-zinc-800/50 text-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-4 justify-center md:justify-start">
                    <button
                      onClick={handleSaveProfile}
                      className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 rounded-lg bg-zinc-800/50 text-gray-400 hover:text-white transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold">{username}</h1>
                  <p className="text-gray-400 text-xl">{nickname}</p>
                  <div className="flex gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 text-gray-400 hover:text-white transition-colors"
                    >
                      <FaEdit />
                      <span>Редактировать профиль</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8 ml-64">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:bg-zinc-800/70 transition-colors">
            <h3 className="text-3xl font-bold mb-2">{tracks.length}</h3>
            <p className="text-gray-400">Загруженных треков</p>
          </div>
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:bg-zinc-800/70 transition-colors">
            <h3 className="text-3xl font-bold mb-2">
              {tracks.reduce((sum, track) => sum + track.plays, 0)}
            </h3>
            <p className="text-gray-400">Всего прослушиваний</p>
          </div>
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:bg-zinc-800/70 transition-colors">
            <h3 className="text-3xl font-bold mb-2">
              {tracks.reduce((sum, track) => sum + track.likes_count, 0)}
            </h3>
            <p className="text-gray-400">Всего лайков</p>
          </div>
        </div>

        {/* Upload Button */}
        <div className="mb-8 flex justify-center md:justify-start">
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg"
          >
            <IoMdAdd className="text-xl" />
            <span>Загрузить новый трек</span>
          </button>
        </div>

        {/* Tracks List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Мои треки</h2>
          <div className="grid gap-4">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                <div className="relative w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg overflow-hidden">
                  {track.cover_path ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${track.cover_path}`}
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaMusic className="text-white text-2xl" />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div 
                      className="flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPause(track);
                      }}
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <FaPause className="text-white text-xl" />
                      ) : (
                        <FaPlay className="text-white text-xl" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-lg">{track.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{track.owner_username}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm text-gray-400">
                    {new Date(track.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-400">{track.plays} прослушиваний</div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(track.id);
                      }}
                      className={`p-2 text-gray-400 hover:text-white transition-colors ${
                        track.is_liked ? 'text-red-500 hover:text-red-600' : ''
                      }`}
                    >
                      {track.is_liked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-8 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Загрузить трек</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Название трека
                </label>
                <input
                  type="text"
                  value={trackName}
                  onChange={(e) => setTrackName(e.target.value)}
                  className="w-full bg-zinc-800/50 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Введите название трека"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Аудио файл
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleTrackFileChange}
                  className="w-full bg-zinc-800/50 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Обложка (необязательно)
                </label>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-zinc-800/50">
                  {trackCover ? (
                    <img 
                      src={trackCover} 
                      alt="Track Cover Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaMusic className="text-gray-400 text-4xl" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTrackCoverChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {uploadError && (
                <p className="text-red-500 text-sm">{uploadError}</p>
              )}

              <div className="flex gap-4 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setTrackName('');
                    setTrackFile(null);
                    setTrackCoverFile(null);
                    setTrackCover(null);
                    setUploadError(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-zinc-800/50 text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleTrackUpload}
                  disabled={uploadingTrack}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingTrack ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Загрузка...</span>
                    </div>
                  ) : (
                    'Загрузить'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <PlayerBar />
    </div>
  );
} 