"use client"
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface Track {
  id: string;
  name: string;
  owner_username: string;
  file_path: string;
  cover_path: string | null;
  plays?: number;
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seekTo: (time: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playStartTime = useRef<number | null>(null);
  const hasPlayedEnough = useRef<boolean>(false);

  useEffect(() => {
    // Создаем аудио элемент при монтировании
    audioRef.current = new Audio();
    
    // Устанавливаем начальную громкость
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }

    return () => {
      // Очищаем при размонтировании
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const sendPlayComplete = async () => {
    if (currentTrack && playStartTime.current && hasPlayedEnough.current) {
      try {
        console.log('Sending play complete request...');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tracks/${currentTrack.id}/play-complete`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Play count updated:', data.plays);
          if (currentTrack && data.plays !== undefined) {
            setCurrentTrack(prev => prev ? { ...prev, plays: data.plays } : null);
          }
        }
      } catch (error) {
        console.error('Error completing track play:', error);
      }
      playStartTime.current = null;
      hasPlayedEnough.current = false;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      
      // Проверяем, проиграл ли трек достаточно времени
      if (playStartTime.current && !hasPlayedEnough.current) {
        const playDuration = (Date.now() - playStartTime.current) / 1000;
        if (playDuration >= 25) {
          console.log('Track played for more than 25 seconds');
          hasPlayedEnough.current = true;
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = async () => {
      setIsPlaying(false);
      setCurrentTime(0);
      await sendPlayComplete();
    };

    const handlePause = async () => {
      await sendPlayComplete();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentTrack]);

  const playTrack = async (track: Track) => {
    if (!audioRef.current) return;

    try {
      if (currentTrack?.id !== track.id) {
        // Если переключаемся на новый трек, отправляем запрос о завершении предыдущего
        await sendPlayComplete();
        audioRef.current.src = `${process.env.NEXT_PUBLIC_API_URL}${track.file_path}`;
        setCurrentTrack(track);
      }
      await audioRef.current.play();
      setIsPlaying(true);
      // Записываем время начала воспроизведения
      playStartTime.current = Date.now();
      hasPlayedEnough.current = false;
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        await audioRef.current.play();
        // Записываем время начала воспроизведения
        playStartTime.current = Date.now();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playTrack,
        togglePlayPause,
        setVolume: handleVolumeChange,
        toggleMute: handleToggleMute,
        seekTo,
        audioRef,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
} 