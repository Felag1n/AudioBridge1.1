"use client"
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaPlay, FaPause, FaHeart, FaRegHeart } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import { useAuth } from '@/hooks/useAuth';
import { useAudio } from '@/contexts/AudioContext';
import Image from 'next/image';

interface User {
  username: string;
  email: string | null;
  full_name: string | null;
  nickname: string | null;
  avatar_path: string | null;
}

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

interface UserStats {
  total_tracks: number;
  total_plays: number;
  total_likes: number;
}

export default function ProfilePage() {
  const { username } = useParams();
  const { isAuthenticated } = useAuth();
  const { playTrack, isPlaying, togglePlayPause, currentTrack } = useAudio();
  const [user, setUser] = useState<User | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [username]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${username}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }

      // Fetch user tracks
      const tracksResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${username}/tracks`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json();
        setTracks(tracksData);
      }

      // Fetch user stats
      const statsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${username}/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async (track: Track) => {
    if (isPlaying && currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleLike = async (trackId: string, isLiked: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/${trackId}/like`,
        {
          method: isLiked ? 'DELETE' : 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.ok) {
        setTracks(prev => prev.map(track => 
          track.id === trackId 
            ? { 
                ...track, 
                is_liked: !isLiked,
                likes_count: isLiked ? track.likes_count - 1 : track.likes_count + 1
              }
            : track
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Пользователь не найден</h1>
          <p className="text-gray-400">Пользователь с таким именем не существует</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white">
      <Sidebar onSearchClick={() => {}} />
      <div className="ml-64 p-8">
        {/* Profile Header */}
        <div className="relative h-[40vh] bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
          
          <div className="relative h-full flex items-end p-8">
            <div className="flex gap-8 items-end w-full">
              {/* Avatar */}
              <div className="relative w-48 h-48 rounded-full overflow-hidden bg-zinc-800">
                {user.avatar_path ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar_path}`}
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold mb-2">{user.nickname || user.username}</h1>
                  <h2 className="text-xl text-gray-300">@{user.username}</h2>
                </div>

                {stats && (
                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span>{stats.total_tracks} треков</span>
                    <span>{stats.total_plays.toLocaleString()} прослушиваний</span>
                    <span>{stats.total_likes.toLocaleString()} лайков</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Треки</h2>
          <div className="space-y-4">
            {tracks.map((track) => (
              <div 
                key={track.id}
                className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 bg-zinc-800 rounded-md overflow-hidden cursor-pointer"
                    onClick={() => handlePlayPause(track)}
                  >
                    {track.cover_path ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}${track.cover_path}`}
                        alt={track.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaPlay className="text-gray-400 text-2xl" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{track.name}</h3>
                    <p className="text-sm text-gray-400">{track.plays.toLocaleString()} прослушиваний</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {isAuthenticated && (
                      <button
                        onClick={() => handleLike(track.id, track.is_liked)}
                        className={`text-gray-300 hover:text-white transition-colors ${
                          track.is_liked
                            ? 'text-orange-500 hover:text-orange-600'
                            : 'text-gray-300 hover:text-white'
                        }`}
                      >
                        {track.is_liked ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    )}
                    <span className="text-sm text-gray-400">{track.likes_count}</span>
                  </div>
                </div>
              </div>
            ))}

            {tracks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                У пользователя пока нет треков
              </div>
            )}
          </div>
        </div>
      </div>

      <PlayerBar />
    </div>
  );
} 