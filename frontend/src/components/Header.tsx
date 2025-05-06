"use client"
import Link from 'next/link';
import { FaUser, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#121212] border-b border-gray-800 z-50">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <FaUser className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold text-white">AudioBridge</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link 
              href="/auth/login" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              <FaSignInAlt />
              <span>Войти</span>
            </Link>
            <Link 
              href="/auth/register" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-colors"
            >
              <FaUserPlus />
              <span>Регистрация</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 