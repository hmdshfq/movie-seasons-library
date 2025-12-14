import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { watchlistService } from "../services/watchlist.service";
import { useAuth } from "./AuthContext";

export const WatchlistContext = createContext();


export function WatchlistProvider({ children }) {
  const { profile } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch watchlist from DB when profile changes
  useEffect(() => {
    if (!profile) {
      setWatchlist([]);
      return;
    }
    setLoading(true);
    watchlistService.getWatchlist()
      .then((data) => setWatchlist(data))
      .catch(() => setWatchlist([]))
      .finally(() => setLoading(false));
  }, [profile]);

  const addToWatchlist = useCallback(async (movie) => {
    if (!profile) {
      console.error("No profile selected. Cannot add to watchlist.");
      return;
    }
    try {
      // Check for duplicate by movie_id and media_type
      const exists = watchlist.some((m) => m.movie_id === movie.id && m.media_type === (movie.media_type || 'movie'));
      if (exists) {
        console.warn("Already in watchlist", movie.id, movie.media_type);
        return;
      }
      const added = await watchlistService.addToWatchlist(movie);
      setWatchlist((prev) => [added, ...prev]);
    } catch (e) {
      console.error("Failed to add to watchlist:", e);
    }
  }, [profile, watchlist]);

  const removeFromWatchlist = useCallback(async (movieId, mediaType = 'movie') => {
    if (!profile) return;
    try {
      await watchlistService.removeFromWatchlist(movieId, mediaType);
      setWatchlist((prev) => prev.filter((m) => !(m.movie_id === movieId && m.media_type === mediaType)));
    } catch (e) {
      // Optionally handle error
    }
  }, [profile]);

  const isInWatchlist = useCallback((movieId) => {
    return watchlist.some((m) => m.movie_id === movieId);
  }, [watchlist]);

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, loading }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
