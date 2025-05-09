"use client"
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaShare, FaEllipsisH } from 'react-icons/fa';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import TrackComments from '@/components/TrackComments';
import { useAuth } from '@/hooks/useAuth';
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

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

export default function TrackPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [track, setTrack] = useState<Track | null>(null);
  const [activeTab, setActiveTab] = useState('comments');
  const { playTrack, isPlaying, togglePlayPause, currentTrack } = useAudio();

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const trackData = await response.json();
          setTrack(trackData);
        }
      } catch (error) {
        console.error('Error fetching track:', error);
      }
    };

    if (id) {
      fetchTrack();
    }
  }, [id]);

  // Обновляем количество прослушиваний при изменении currentTrack
  useEffect(() => {
    if (currentTrack?.id === id && typeof currentTrack?.plays === 'number' && track) {
      const newPlays = currentTrack.plays;
      setTrack(prev => {
        if (!prev || prev.plays === newPlays) return prev;
        return { ...prev, plays: newPlays };
      });
    }
  }, [currentTrack?.plays, id]);

  const handlePlayPause = async () => {
    if (!track) return;
    
    if (isPlaying) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleLike = async () => {
    if (!track) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tracks/${track.id}/like`,
        {
          method: track.is_liked ? 'DELETE' : 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.ok) {
        setTrack({
          ...track,
          is_liked: !track.is_liked,
          likes_count: track.is_liked ? track.likes_count - 1 : track.likes_count + 1
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!track) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Загрузка трека...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white">
      <Sidebar onSearchClick={() => {}} />
      <div className="ml-64 p-8">
        {/* Hero Section with Cover */}
        <div className="relative h-[60vh] bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
          
          <div className="relative h-full flex items-end p-8">
            <div className="flex gap-8 items-end w-full">
              {/* Cover Image */}
              <div 
                className="relative w-full md:w-96 aspect-square rounded-xl overflow-hidden bg-zinc-800/50 cursor-pointer group"
                onClick={handlePlayPause}
              >
                {track.cover_path ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${track.cover_path}`}
                    alt={track.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaPlay className="text-gray-400 text-6xl" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isPlaying ? (
                    <FaPause className="text-white text-6xl" />
                  ) : (
                    <FaPlay className="text-white text-6xl" />
                  )}
                </div>
              </div>
              
              {/* Track Info */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold mb-2">{track.name}</h1>
                  <h2 className="text-xl text-gray-300 mb-4">by {track.owner_username}</h2>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      className={`text-gray-300 hover:text-white transition-colors ${
                        track.is_liked
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      <FaHeart className="text-xl" />
                    </button>
                    <button className="text-gray-300 hover:text-white transition-colors">
                      <FaShare className="text-xl" />
                    </button>
                    <button className="text-gray-300 hover:text-white transition-colors">
                      <FaEllipsisH className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span>{track.plays.toLocaleString()} прослушиваний</span>
                  <span>{track.likes_count.toLocaleString()} лайков</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b border-gray-800">
          <div className="flex gap-8">
            <button 
              className={`py-4 text-sm font-medium ${activeTab === 'comments' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('comments')}
            >
              Комментарии
            </button>
            <button 
              className={`py-4 text-sm font-medium ${activeTab === 'details' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('details')}
            >
              Подробности
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {activeTab === 'comments' && <TrackComments comments={[]} />}
          
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">О треке</h3>
                <p className="text-gray-400 leading-relaxed">{track.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#181818] p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-2">Дата выхода</h4>
                  <p className="text-gray-300">{new Date(track.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-2">Длительность</h4>
                  <p className="text-gray-300">{track.duration}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <PlayerBar />
    </div>
  );
} 