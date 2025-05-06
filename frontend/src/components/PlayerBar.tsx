"use client"
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeUp, FaVolumeMute, FaRandom, FaRedo } from 'react-icons/fa';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useState } from 'react';

interface PlayerBarProps {
  currentTrack: {
    title: string;
    artist: string;
    coverUrl?: string;
  };
}

export default function PlayerBar({ currentTrack }: PlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(30);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const handleProgressChange = (value: number[]) => {
    setProgress(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-[#181818] to-[#121212] border-t border-gray-800 flex items-center px-6">
      {/* Track Info */}
      <div className="flex items-center w-1/4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mr-4 overflow-hidden">
          {currentTrack.coverUrl ? (
            <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaPlay className="text-white/50 text-2xl" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-white truncate">{currentTrack.title}</h4>
          <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center">
        <div className="flex items-center gap-6 mb-2">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  className={`p-2 rounded-full transition-colors ${isShuffle ? 'text-green-500 hover:text-green-400' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setIsShuffle(!isShuffle)}
                >
                  <FaRandom className="text-xl" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
                  sideOffset={5}
                >
                  Shuffle
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <FaStepBackward className="text-xl" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
                  sideOffset={5}
                >
                  Previous
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  className="bg-white text-black rounded-full p-4 hover:scale-105 transition-transform shadow-lg"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <FaPause className="text-xl" /> : <FaPlay className="text-xl" />}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
                  sideOffset={5}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <FaStepForward className="text-xl" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
                  sideOffset={5}
                >
                  Next
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button 
                  className={`p-2 rounded-full transition-colors ${isRepeat ? 'text-green-500 hover:text-green-400' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setIsRepeat(!isRepeat)}
                >
                  <FaRedo className="text-xl" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content 
                  className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
                  sideOffset={5}
                >
                  Repeat
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full max-w-2xl">
          <span className="text-xs text-gray-400 w-12">1:23</span>
          <Slider.Root 
            className="relative flex items-center select-none touch-none w-full h-5 group"
            value={[progress]}
            onValueChange={handleProgressChange}
            max={100}
            step={1}
          >
            <Slider.Track className="bg-gray-600 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-white rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb 
              className="block w-3 h-3 bg-white rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Progress"
            />
          </Slider.Root>
          <span className="text-xs text-gray-400 w-12">3:45</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="w-1/4 flex justify-end items-center gap-4">
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button 
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content 
                className="bg-black/90 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
                sideOffset={5}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Slider.Root 
          className="relative flex items-center select-none touch-none w-24 h-5 group"
          value={[isMuted ? 0 : volume]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
        >
          <Slider.Track className="bg-gray-600 relative grow rounded-full h-1">
            <Slider.Range className="absolute bg-white rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb 
            className="block w-3 h-3 bg-white rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Volume"
          />
        </Slider.Root>
      </div>
    </div>
  );
} 