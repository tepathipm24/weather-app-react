import { useState, useEffect, useCallback } from 'react';
import { searchLocations, type SearchLocation } from '../services/weatherService';

interface UseLocationSearchReturn {
  suggestions: SearchLocation[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSuggestions: () => void;
}

export const useLocationSearch = (debounceMs: number = 300): UseLocationSearchReturn => {
  const [suggestions, setSuggestions] = useState<SearchLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [debounceMs]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  return {
    suggestions,
    isLoading,
    searchQuery,
    setSearchQuery,
    clearSuggestions,
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}