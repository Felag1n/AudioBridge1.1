"use client"
import { useState } from 'react';
import Link from 'next/link';
import { 
  FaHome, 
  FaSearch, 
  FaMusic, 
  FaHeart, 
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';

interface SidebarProps {
  onSearchClick: () => void;
}

export default function Sidebar({ onSearchClick }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('home');

  const menuItems = [
    { id: 'home', icon: FaHome, label: 'Главная', href: '/' },
    { id: 'search', icon: FaSearch, label: 'Поиск', onClick: onSearchClick },
    { id: 'library', icon: FaMusic, label: 'Моя медиатека', href: '/library' },
    { id: 'favorites', icon: FaHeart, label: 'Избранное', href: '/favorites' },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#121212] border-r border-gray-800 overflow-y-auto z-30">
      <div className="p-4">
        {/* Main Navigation */}
        <nav className="space-y-2 mb-8">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-colors ${
                    activeItem === item.id
                      ? 'bg-zinc-800/50 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                  onClick={() => setActiveItem(item.id)}
                >
                  <item.icon className="text-xl" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setActiveItem(item.id);
                    item.onClick?.();
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-2 rounded-lg transition-colors ${
                    activeItem === item.id
                      ? 'bg-zinc-800/50 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <item.icon className="text-xl" />
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800 pt-4">
          <Link
            href="/profile"
            className="flex items-center gap-4 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            <FaUser className="text-xl" />
            <span>Профиль</span>
          </Link>
          <button className="w-full flex items-center gap-4 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
            <FaSignOutAlt className="text-xl" />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </aside>
  );
} 