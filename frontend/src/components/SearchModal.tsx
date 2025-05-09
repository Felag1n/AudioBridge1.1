"use client"
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { Search, Music, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  username: string;
  full_name: string | null;
  nickname: string | null;
  avatar_path: string | null;
}

interface Track {
  id: string;
  name: string;
  owner_username: string;
  cover_path: string | null;
  likes_count: number;
  plays: number;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setUsers([]);
        setTracks([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, activeTab]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      let response;
      if (activeTab === 'all') {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search?query=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
          setTracks(data.tracks);
        }
      } else if (activeTab === 'users') {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search/users?query=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          setTracks([]);
        }
      } else if (activeTab === 'tracks') {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search/tracks?query=${encodeURIComponent(searchQuery)}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          }
        );
        if (response.ok) {
          const data = await response.json();
          setTracks(data);
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (username: string) => {
    router.push(`/profile/${username}`);
    onClose();
  };

  const handleTrackClick = (trackId: string) => {
    router.push(`/track/${trackId}`);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-zinc-900 text-zinc-50 max-w-2xl w-full rounded-lg border border-zinc-800 shadow-lg z-50">
          <div className="space-y-4 p-6">
            <DialogTitle className="text-xl font-bold">Поиск</DialogTitle>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Поиск треков или @пользователей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-50"
                />
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex space-x-2 bg-zinc-800 p-1 rounded-md">
                  <TabsTrigger 
                    value="all" 
                    className="px-4 py-2 rounded-md data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
                  >
                    Все
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tracks" 
                    className="px-4 py-2 rounded-md data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
                  >
                    Треки
                  </TabsTrigger>
                  <TabsTrigger 
                    value="users" 
                    className="px-4 py-2 rounded-md data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
                  >
                    Пользователи
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                      </div>
                    ) : (
                      <>
                        {tracks.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-zinc-400 mb-2">Треки</h3>
                            {tracks.map((track) => (
                              <div
                                key={track.id}
                                className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 cursor-pointer"
                                onClick={() => handleTrackClick(track.id)}
                              >
                                <div className="w-10 h-10 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0">
                                  {track.cover_path ? (
                                    <Image
                                      src={`${process.env.NEXT_PUBLIC_API_URL}${track.cover_path}`}
                                      alt={track.name}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Music className="w-full h-full p-2 text-zinc-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-zinc-200">{track.name}</p>
                                  <p className="text-sm text-zinc-400">by {track.owner_username}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {users.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-zinc-400 mb-2">Пользователи</h3>
                            {users.map((user) => (
                              <div
                                key={user.username}
                                className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 cursor-pointer"
                                onClick={() => handleUserClick(user.username)}
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0 overflow-hidden">
                                  {user.avatar_path ? (
                                    <Image
                                      src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar_path}`}
                                      alt={user.username}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <User className="w-full h-full p-2 text-white" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-zinc-200">@{user.username}</p>
                                  <p className="text-sm text-zinc-400">{user.nickname || user.full_name || ''}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!isLoading && tracks.length === 0 && users.length === 0 && searchQuery && (
                          <p className="text-center text-zinc-400 py-4">Ничего не найдено</p>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tracks" className="mt-4">
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                      </div>
                    ) : (
                      <>
                        {tracks.map((track) => (
                          <div
                            key={track.id}
                            className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 cursor-pointer"
                            onClick={() => handleTrackClick(track.id)}
                          >
                            <div className="w-10 h-10 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0">
                              {track.cover_path ? (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_API_URL}${track.cover_path}`}
                                  alt={track.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Music className="w-full h-full p-2 text-zinc-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-200">{track.name}</p>
                              <p className="text-sm text-zinc-400">by {track.owner_username}</p>
                            </div>
                          </div>
                        ))}
                        {!isLoading && tracks.length === 0 && searchQuery && (
                          <p className="text-center text-zinc-400 py-4">Треки не найдены</p>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="users" className="mt-4">
                  <div className="space-y-2">
                    {isLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                      </div>
                    ) : (
                      <>
                        {users.map((user) => (
                          <div
                            key={user.username}
                            className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 cursor-pointer"
                            onClick={() => handleUserClick(user.username)}
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex-shrink-0 overflow-hidden">
                              {user.avatar_path ? (
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar_path}`}
                                  alt={user.username}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-full h-full p-2 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-200">@{user.username}</p>
                              <p className="text-sm text-zinc-400">{user.nickname || user.full_name || ''}</p>
                            </div>
                          </div>
                        ))}
                        {!isLoading && users.length === 0 && searchQuery && (
                          <p className="text-center text-zinc-400 py-4">Пользователи не найдены</p>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 