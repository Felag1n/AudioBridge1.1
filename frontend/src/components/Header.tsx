"use client"
import Link from 'next/link';
import { FaUser, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Проверяем токен при каждом рендере
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token && isAuthenticated) {
      window.location.reload();
    }
  }, [isAuthenticated]);

  if (!mounted) {
    return null;
  }

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
            {!isAuthenticated ? (
              <>
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
              </>
            ) : (
              <Link 
                href="/profile" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {user?.avatar_path ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar_path}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <FaUser className="text-white text-sm" />
                    </div>
                  )}
                </div>
                <span>{user?.username || 'Профиль'}</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 