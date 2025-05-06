"use client"
import { useState } from 'react';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';
import Header from '@/components/Header';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика регистрации
    console.log('Registration attempt:', formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Создать аккаунт</h1>
            <p className="text-gray-400">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-purple-500 hover:text-purple-400">
                Войти
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Имя пользователя
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-[#121212] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Введите имя пользователя"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#121212] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Введите email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#121212] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Введите пароль"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Подтвердите пароль
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[#121212] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Подтвердите пароль"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 rounded border-gray-600 bg-[#121212] text-purple-500 focus:ring-purple-500"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
                Я согласен с{' '}
                <Link href="/terms" className="text-purple-500 hover:text-purple-400">
                  условиями использования
                </Link>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-[1.02]"
            >
              Зарегистрироваться
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#121212] text-gray-400">
                  Или зарегистрируйтесь через
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#121212] text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                <FaGoogle />
                <span>Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#121212] text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                <FaGithub />
                <span>GitHub</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#121212] text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors">
                <FaFacebook />
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 