import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const SEARCH_HISTORY_KEY = "search.history";
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addToHistory = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      try {
        // Remove duplicates and add new query at the top
        const filtered = history.filter(
          (item) => item.query.toLowerCase() !== query.toLowerCase(),
        );
        const newHistory = [
          { query: query.trim(), timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_HISTORY_ITEMS);

        setHistory(newHistory);
        await AsyncStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(newHistory),
        );
      } catch (error) {
        console.error("Failed to add to search history:", error);
      }
    },
    [history],
  );

  const removeFromHistory = useCallback(
    async (query: string) => {
      try {
        const filtered = history.filter((item) => item.query !== query);
        setHistory(filtered);
        await AsyncStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(filtered),
        );
      } catch (error) {
        console.error("Failed to remove from search history:", error);
      }
    },
    [history],
  );

  const clearHistory = useCallback(async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  }, []);

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
