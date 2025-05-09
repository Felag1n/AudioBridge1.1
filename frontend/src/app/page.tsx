"use client"
import { useState, useEffect } from 'react';
import { FaPlay, FaHeart, FaShare, FaEllipsisH, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import { SearchModal } from '@/components/SearchModal';
import { apiClient, Track as ApiTrack } from '@/lib/api';
import { useAudio } from '@/contexts/AudioContext';
import { AuthGuard } from '@/components/AuthGuard';

type SortField = 'likes' | 'date' | 'plays';
type SortOrder = 'asc' | 'desc';

export default function Home() {
  const [activeItem, setActiveItem] = useState('home');
  const [showSearch, setShowSearch] = useState(false);
  const [tracks, setTracks] = useState<ApiTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('likes');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const { playTrack } = useAudio();

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTracks();
      setTracks(data);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setError('Не удалось загрузить треки');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleLike = async (trackId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await apiClient.unlikeTrack(trackId);
      } else {
        await apiClient.likeTrack(trackId);
      }
      fetchTracks();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handlePlay = async (track: ApiTrack) => {
    try {
      await apiClient.incrementPlayCount(track.id);
      const audioTrack = {
        id: track.id,
        name: track.name,
        owner_username: track.owner_username,
        file_path: track.file_path,
        cover_path: track.cover_path || null,
        plays: track.plays
      };
      playTrack(audioTrack);
      fetchTracks();
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const sortedTracks = [...tracks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'likes':
        comparison = b.likes_count - a.likes_count;
        break;
      case 'date':
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        break;
      case 'plays':
        comparison = b.plays - a.plays;
        break;
    }
    
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white">
        <Header />
        <Sidebar onSearchClick={() => setShowSearch(true)} />
        
        <main className="ml-64 pt-16">
          <div className="container mx-auto px-8 py-8">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold mb-4">Все треки</h1>
              <p className="text-gray-400 text-lg">
                Откройте для себя новую музыку
              </p>
            </div>

            {/* Sorting Controls */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortField('likes')}
                  className={`px-4 py-2 rounded-lg ${
                    sortField === 'likes' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                  }`}
                >
                  По лайкам
                </button>
                <button
                  onClick={() => setSortField('date')}
                  className={`px-4 py-2 rounded-lg ${
                    sortField === 'date' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                  }`}
                >
                  По дате
                </button>
                <button
                  onClick={() => setSortField('plays')}
                  className={`px-4 py-2 rounded-lg ${
                    sortField === 'plays' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                  }`}
                >
                  По прослушиваниям
                </button>
              </div>
              <button
                onClick={toggleSortOrder}
                className="p-2 rounded-lg bg-zinc-800 text-gray-400 hover:bg-zinc-700"
              >
                {sortOrder === 'desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              </button>
            </div>

            {/* Tracks Grid */}
            {loading ? (
              <div className="text-center text-gray-400">Загрузка...</div>
            ) : error ? (
              <div className="text-center text-red-400">{error}</div>
            ) : sortedTracks.length === 0 ? (
              <div className="text-center text-gray-400">Треки не найдены</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedTracks.map(track => (
                  <div
                    key={track.id}
                    className="group relative bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors flex flex-col"
                  >
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 mb-4 overflow-hidden">
                      {track.cover_path && (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL}${track.cover_path}`}
                          alt={track.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handlePlay(track)}
                          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <FaPlay className="text-white text-xl" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-between mb-2 flex-1">
                      <div className="max-w-[70%]">
                        <h3 className="font-medium mb-1 line-clamp-2">{track.name}</h3>
                        <p className="text-sm text-gray-400 truncate">{track.owner_username}</p>
                      </div>
                      <button
                        onClick={() => handleLike(track.id, track.is_liked)}
                        className={`p-2 rounded-full ${
                          track.is_liked 
                            ? 'text-red-500 hover:text-red-400' 
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <FaHeart />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 text-sm text-gray-400 mt-auto">
                      <div className="flex items-center justify-between">
                        <span>Прослушиваний:</span>
                        <span>{track.plays.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Лайков:</span>
                        <span>{track.likes_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Загружен:</span>
                        <span>{formatDate(track.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <PlayerBar />
        <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
      </div>
    </AuthGuard>
  );
}
