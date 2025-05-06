import { create } from 'zustand';

interface SearchStore {
  isOpen: boolean;
  searchQuery: string;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  searchQuery: '',
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
})); 