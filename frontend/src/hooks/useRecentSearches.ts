import { useState, useCallback } from 'react';

export interface RecentSearch {
  from: string;
  to: string;
  timestamp: number;
}

const STORAGE_KEY = 'dhaka-transit-recent-searches';
const MAX_ITEMS = 5;

function loadSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(loadSearches);

  const addSearch = useCallback((from: string, to: string) => {
    const newSearch: RecentSearch = {
      from,
      to,
      timestamp: Date.now()
    };

    setRecentSearches(prev => {
      const filtered = prev.filter(
        s => !(s.from === from && s.to === to)
      );
      const updated = [newSearch, ...filtered].slice(0, MAX_ITEMS);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const removeSearch = useCallback((index: number) => {
    setRecentSearches(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { recentSearches, addSearch, removeSearch, clearAll };
}