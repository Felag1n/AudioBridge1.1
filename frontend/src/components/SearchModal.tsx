"use client"
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { Search, Music, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Здесь будет логика поиска
    console.log('Searching for:', searchQuery, 'in tab:', activeTab);
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
            
            <form onSubmit={handleSearch} className="space-y-4">
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
                  <div className="space-y-2">
                    <div className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 cursor-pointer">
                      <Music className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="font-medium text-zinc-200">Название трека</p>
                        <p className="text-sm text-zinc-400">Исполнитель</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tracks" className="mt-4">
                  <div className="space-y-2">
                    <div className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 cursor-pointer">
                      <Music className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="font-medium text-zinc-200">Название трека</p>
                        <p className="text-sm text-zinc-400">Исполнитель</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="users" className="mt-4">
                  <div className="space-y-2">
                    <div className="p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 cursor-pointer">
                      <User className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p className="font-medium text-zinc-200">@username</p>
                        <p className="text-sm text-zinc-400">Имя пользователя</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 