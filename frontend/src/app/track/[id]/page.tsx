"use client"
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaShare, FaEllipsisH, FaRandom, FaRedo, FaComment } from 'react-icons/fa';
import { IoMdMusicalNote } from 'react-icons/io';
import { BsCollectionPlay } from 'react-icons/bs';
import { RiPlayListFill } from 'react-icons/ri';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import TrackComments from '@/components/TrackComments';
import Image from 'next/image';
import { useState } from 'react';

interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverUrl: string;
  description: string;
  genre: string;
  releaseDate: string;
  likes: number;
  plays: number;
  waveform: string;
  reposts: number;
  comments: number;
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

// This would normally come from an API
const mockTrack: Track = {
  id: 1,
  title: "Пример Трека",
  artist: "Имя Исполнителя",
  album: "Название Альбома",
  duration: "3:45",
  coverUrl: "/track-cover.jpg",
  description: "Это описание трека. Оно может быть довольно длинным и содержать информацию о треке, процессе его создания и вдохновении исполнителя.",
  genre: "Электроника",
  releaseDate: "2024-05-05",
  likes: 1234,
  plays: 45678,
  waveform: "M0,50 L100,50 L200,30 L300,70 L400,20 L500,80 L600,40 L700,60 L800,50 L900,50 L1000,50",
  reposts: 234,
  comments: 56
};

const mockComments: Comment[] = [
  {
    id: 1,
    user: {
      name: "User1",
      avatar: "/avatar1.jpg"
    },
    text: "This track is amazing! The production quality is outstanding.",
    timestamp: "2 hours ago",
    likes: 45,
    isLiked: false,
    replies: [
      {
        id: 2,
        user: {
          name: "Artist Name",
          avatar: "/artist.jpg"
        },
        text: "Thank you! I'm glad you like it.",
        timestamp: "1 hour ago",
        likes: 12,
        isLiked: false
      }
    ]
  },
  {
    id: 3,
    user: {
      name: "User2",
      avatar: "/avatar2.jpg"
    },
    text: "The melody is so catchy, I can't stop listening to it!",
    timestamp: "5 hours ago",
    likes: 32,
    isLiked: true
  }
];

export default function TrackPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  const handleCoverClick = () => {
    setIsPlaying(true);
    setShowPlayer(true);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Sidebar />
      
      <div className="ml-64">
        {/* Hero Section with Cover */}
        <div className="relative h-[60vh] bg-gradient-to-b from-[#1a1a1a] to-[#121212]">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
          
          <div className="relative h-full flex items-end p-8">
            <div className="flex gap-8 items-end w-full">
              {/* Cover Image */}
              <div 
                className="w-64 h-64 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-300 relative overflow-hidden cursor-pointer group"
                onClick={handleCoverClick}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaPlay className="text-4xl text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              </div>
              
              {/* Track Info */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold mb-2">{mockTrack.title}</h1>
                  <h2 className="text-xl text-gray-300 mb-4">{mockTrack.artist}</h2>
                  
                  <div className="flex items-center gap-4">
                    <button className="text-gray-300 hover:text-white transition-colors">
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
                  <span>{mockTrack.plays.toLocaleString()} прослушиваний</span>
                  <span>{mockTrack.likes.toLocaleString()} лайков</span>
                  <span>{mockTrack.reposts.toLocaleString()} репостов</span>
                  <span>{mockTrack.comments.toLocaleString()} комментариев</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waveform */}
        <div className="px-8 py-4">
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400" style={{ width: '30%' }} />
            <div className="absolute top-1/2 left-[30%] w-3 h-3 bg-white rounded-full -translate-y-1/2" />
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>1:23</span>
            <span>{mockTrack.duration}</span>
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
          {activeTab === 'comments' && <TrackComments comments={mockComments} />}
          
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">О треке</h3>
                <p className="text-gray-400 leading-relaxed">{mockTrack.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#181818] p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-2">Альбом</h4>
                  <p className="text-gray-300">{mockTrack.album}</p>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-2">Жанр</h4>
                  <p className="text-gray-300">{mockTrack.genre}</p>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-2">Дата выхода</h4>
                  <p className="text-gray-300">{mockTrack.releaseDate}</p>
                </div>
                <div className="bg-[#181818] p-4 rounded-lg">
                  <h4 className="text-sm text-gray-500 mb-2">Длительность</h4>
                  <p className="text-gray-300">{mockTrack.duration}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPlayer && <PlayerBar currentTrack={mockTrack} />}
    </div>
  );
} 