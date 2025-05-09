"use client"
import { useState } from 'react';
import { FaPlay, FaPause, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useAudio } from '@/contexts/AudioContext';

interface TrackCardProps {
  track: {
    id: string;
    name: string;
    owner_username: string;
    cover_path: string | null;
    file_path: string;
    likes_count: number;
    is_liked: boolean;
  };
  onLike: (trackId: string) => void;
}

export default function TrackCard({ track, onLike }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudio();

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события клика
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события клика
    onLike(track.id);
  };

  const handleCardClick = () => {
    router.push(`/track/${track.id}`);
  };

  return (
    <div 
      className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative aspect-square mb-4 rounded-md overflow-hidden bg-zinc-800/50">
        {track.cover_path ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${track.cover_path}`}
            alt={track.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaPlay className="text-gray-400 text-4xl" />
          </div>
        )}
        <div 
          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handlePlayPause}
        >
          {currentTrack?.id === track.id && isPlaying ? (
            <FaPause className="text-white text-4xl" />
          ) : (
            <FaPlay className="text-white text-4xl" />
          )}
        </div>
      </div>
      
      <h3 className="font-medium text-white mb-1 truncate">{track.name}</h3>
      <p className="text-sm text-gray-400 mb-2 truncate">{track.owner_username}</p>
      
      <div className="flex items-center justify-between">
        <button
          onClick={handleLike}
          className={`text-gray-400 hover:text-white transition-colors ${
            track.is_liked ? 'text-red-500 hover:text-red-600' : ''
          }`}
        >
          {track.is_liked ? <FaHeart /> : <FaRegHeart />}
        </button>
        <span className="text-sm text-gray-400">{track.likes_count}</span>
      </div>
    </div>
  );
} 