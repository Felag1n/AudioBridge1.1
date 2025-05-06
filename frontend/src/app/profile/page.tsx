"use client"
import { useState, useRef } from 'react';
import { FaUser, FaMusic, FaEdit, FaTrash, FaHeart, FaShare, FaCamera, FaPlay } from 'react-icons/fa';
import { IoMdAdd } from 'react-icons/io';

export default function ProfilePage() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('Мой профиль');
  const [nickname, setNickname] = useState('@username');
  const [avatar, setAvatar] = useState('/default-avatar.jpg');
  const [trackCover, setTrackCover] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [tracks, setTracks] = useState([
    {
      id: 1,
      title: 'Мой первый трек',
      artist: 'Я',
      duration: '3:45',
      uploadDate: '2024-05-06',
      plays: 120,
      likes: 45,
      coverUrl: '/track-cover.jpg'
    },
    {
      id: 2,
      title: 'Второй трек',
      artist: 'Я',
      duration: '4:20',
      uploadDate: '2024-05-05',
      plays: 85,
      likes: 32,
      coverUrl: '/track-cover2.jpg'
    }
  ]);

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleDeleteTrack = (id: number) => {
    setTracks(tracks.filter(track => track.id !== id));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTrackCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Здесь будет логика сохранения профиля
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white">
      {/* Profile Header */}
      <div className="relative">
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
                  <FaCamera className="text-white text-3xl" />
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
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800/50 text-gray-400 hover:text-white transition-colors mx-auto md:mx-0"
                  >
                    <FaEdit />
                    <span>Редактировать профиль</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8">
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
              {tracks.reduce((sum, track) => sum + track.likes, 0)}
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
                  <FaMusic className="text-white text-2xl" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaPlay className="text-white text-xl" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate text-lg">{track.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm text-gray-400">{track.duration}</div>
                  <div className="text-sm text-gray-400">{track.uploadDate}</div>
                  <div className="text-sm text-gray-400">{track.plays} прослушиваний</div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <FaHeart />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <FaShare />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <FaEdit />
                    </button>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => handleDeleteTrack(track.id)}
                    >
                      <FaTrash />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#282828] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Загрузка трека</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Название трека
                </label>
                <input
                  type="text"
                  className="w-full bg-[#121212] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Введите название"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Исполнитель
                </label>
                <input
                  type="text"
                  className="w-full bg-[#121212] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Введите исполнителя"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Обложка трека
                </label>
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={handleCoverClick}
                >
                  <div className="w-32 h-32 mx-auto mb-4 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg overflow-hidden">
                    {trackCover ? (
                      <img 
                        src={trackCover} 
                        alt="Track Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaMusic className="text-white text-3xl" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400">
                    Нажмите для выбора обложки
                  </p>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Аудио файл
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <FaMusic className="mx-auto text-gray-400 text-3xl mb-4" />
                  <p className="text-sm text-gray-400">
                    Перетащите аудио файл сюда или нажмите для выбора
                  </p>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setTrackCover(null);
                  }}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
                >
                  Загрузить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 