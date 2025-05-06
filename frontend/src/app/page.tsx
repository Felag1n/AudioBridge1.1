"use client"
import { useState } from 'react';
import Link from 'next/link';
import { FaPlay, FaHeart, FaShare, FaEllipsisH } from 'react-icons/fa';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import { SearchModal } from '@/components/SearchModal';

export default function Home() {
  const [activeItem, setActiveItem] = useState('home');
  const [showSearch, setShowSearch] = useState(false);

  const recommendedTracks = [
    { 
      id: 1, 
      title: 'Рекомендуемый трек 1', 
      artist: 'Исполнитель 1', 
      duration: '3:45',
      cover: '/track1.jpg',
      plays: 1200
    },
    { 
      id: 2, 
      title: 'Рекомендуемый трек 2', 
      artist: 'Исполнитель 2', 
      duration: '4:20',
      cover: '/track2.jpg',
      plays: 980
    },
    { 
      id: 3, 
      title: 'Рекомендуемый трек 3', 
      artist: 'Исполнитель 3', 
      duration: '3:15',
      cover: '/track3.jpg',
      plays: 750
    },
    { 
      id: 4, 
      title: 'Рекомендуемый трек 4', 
      artist: 'Исполнитель 4', 
      duration: '4:05',
      cover: '/track4.jpg',
      plays: 620
    }
  ];

  const newTracks = [
    { 
      id: 5, 
      title: 'Новый трек 1', 
      artist: 'Исполнитель 5', 
      duration: '3:30',
      cover: '/track5.jpg',
      uploadDate: '2 дня назад'
    },
    { 
      id: 6, 
      title: 'Новый трек 2', 
      artist: 'Исполнитель 6', 
      duration: '4:15',
      cover: '/track6.jpg',
      uploadDate: '1 день назад'
    },
    { 
      id: 7, 
      title: 'Новый трек 3', 
      artist: 'Исполнитель 7', 
      duration: '3:50',
      cover: '/track7.jpg',
      uploadDate: '5 часов назад'
    },
    { 
      id: 8, 
      title: 'Новый трек 4', 
      artist: 'Исполнитель 8', 
      duration: '4:00',
      cover: '/track8.jpg',
      uploadDate: '1 час назад'
    }
  ];

  const currentTrack = {
    id: 1,
    title: 'Текущий трек',
    artist: 'Исполнитель',
    cover: '/current.jpg',
    duration: '3:45',
    progress: 45
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white">
      <Header />
      <Sidebar onSearchClick={() => setShowSearch(true)} />
      
      <main className="ml-64 pt-16">
        <div className="container mx-auto px-8 py-8">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">Добро пожаловать</h1>
            <p className="text-gray-400 text-lg">
              Откройте для себя новую музыку и создавайте свои плейлисты
            </p>
          </div>

          {/* Recommended Tracks Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Рекомендуемые треки</h2>
              <Link 
                href="/recommended" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Показать все
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedTracks.map(track => (
                <div
                  key={track.id}
                  className="group relative bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 mb-4 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <FaPlay className="text-white text-xl" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium mb-1 truncate">{track.title}</h3>
                  <p className="text-sm text-gray-400 mb-2 truncate">{track.artist}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{track.duration}</span>
                    <span>{track.plays.toLocaleString()} прослушиваний</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Tracks Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Новые треки</h2>
              <Link 
                href="/new" 
                className="text-gray-400 hover:text-white transition-colors"
              >
                Показать все
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newTracks.map(track => (
                <div
                  key={track.id}
                  className="group relative bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800/70 transition-colors"
                >
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 mb-4 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                        <FaPlay className="text-white text-xl" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium mb-1 truncate">{track.title}</h3>
                  <p className="text-sm text-gray-400 mb-2 truncate">{track.artist}</p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{track.duration}</span>
                    <span>{track.uploadDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <PlayerBar currentTrack={currentTrack} />
      <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
}
