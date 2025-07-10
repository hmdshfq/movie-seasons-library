import { useContext } from "react";
import { useAuth } from "../contexts/AuthContext";
import { movieService } from "../services/movie.service";
import { WatchlistContext } from "../contexts/WatchlistContext";

// Returns { watched, loading }
import { useEffect, useState } from "react";

export function useWatchedAndWatchlist() {
  const { profile } = useAuth();
  const { watchlist } = useContext(WatchlistContext);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile) {
      setWatched([]);
      return;
    }
    setLoading(true);
    movieService.getWatchedMovies(profile.id)
      .then((data) => setWatched(data))
      .catch(() => setWatched([]))
      .finally(() => setLoading(false));
  }, [profile]);

  return { watched, watchlist, loading };
}
