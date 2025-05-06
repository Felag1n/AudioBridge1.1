"use client"
import { useState } from 'react';
import Link from 'next/link';
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        router.push('/profile');
      } else {
        setError('Неверное имя пользователя или пароль');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#121212] to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Вход в аккаунт</h1>
            <p className="text-gray-400">
              Нет аккаунта?{' '}
              <Link href="/auth/register" className="text-purple-500 hover:text-purple-400">
                Зарегистрироваться
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-600 bg-[#121212] text-purple-500 focus:ring-purple-500"
                  disabled={loading}
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                  Запомнить меня
                </label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm text-purple-500 hover:text-purple-400">
                Забыли пароль?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#121212] text-gray-400">
                  Или войдите через
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button 
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#121212] text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <FaGoogle />
                <span>Google</span>
              </button>
              <button 
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#121212] text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <FaGithub />
                <span>GitHub</span>
              </button>
              <button 
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#121212] text-gray-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
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