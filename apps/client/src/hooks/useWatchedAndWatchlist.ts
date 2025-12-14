import { useContext, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { movieService } from "../services/movie.service";
import { WatchlistContext } from "../contexts/WatchlistContext";

interface WatchedMovie {
  id: number;
  movie_id: number;
  [key: string]: unknown;
}

export function useWatchedAndWatchlist() {
  const { profile } = useAuth();
  const { watchlist } = useContext(WatchlistContext);
  const [watched, setWatched] = useState<WatchedMovie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) {
      setWatched([]);
      return;
    }
    setLoading(true);
    movieService.getWatchedMovies()
      .then((data) => setWatched(data as WatchedMovie[]))
      .catch(() => setWatched([]))
      .finally(() => setLoading(false));
  }, [profile]);

  return { watched, watchlist, loading };
}
