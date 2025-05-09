"use client"
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useAudio } from '@/contexts/AudioContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PlayerBar() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlayPause,
    setVolume,
    toggleMute,
    seekTo,
    playNextTrack,
    playPreviousTrack,
    audioRef
  } = useAudio();

  const [plays, setPlays] = useState<number>(0);

  useEffect(() => {
    if (currentTrack) {
      setPlays(currentTrack.plays || 0);
    }
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePause = async () => {
      if (currentTrack) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${currentTrack.id}/play-complete`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log('Play count updated:', data.plays);
          }
        } catch (error) {
          console.error('Error updating play count:', error);
        }
      }
    };

    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentTrack, audioRef]);

  if (!currentTrack) {
    return null;
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCoverClick = () => {
    router.push(`/track/${currentTrack.id}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] border-t border-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-4 w-1/4">
          {currentTrack.cover_path && (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${currentTrack.cover_path}`}
              alt={currentTrack.name}
              className="w-14 h-14 rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleCoverClick}
            />
          )}
          <div>
            <h3 className="text-sm font-medium text-white cursor-pointer hover:underline" onClick={handleCoverClick}>
              {currentTrack.name}
            </h3>
            <p className="text-xs text-gray-400">{currentTrack.owner_username}</p>
            <p className="text-xs text-gray-400">{plays.toLocaleString()} прослушиваний</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center space-x-6 mb-2">
            <button 
              onClick={playPreviousTrack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaStepBackward />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button 
              onClick={playNextTrack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaStepForward />
            </button>
          </div>
          <div className="w-full flex items-center space-x-2">
            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 w-1/4 justify-end">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white">
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
} 