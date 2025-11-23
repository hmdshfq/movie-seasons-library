
import { useEffect, useState } from "react";
import { useWatchlist } from "../../contexts/WatchlistContext";
import { tmdbService } from "../../services/tmdb.service";
import MovieGrid from "../MovieGrid/MovieGrid";

export default function WatchlistTab() {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [detailedItems, setDetailedItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchDetails() {
      setLoading(true);
      try {
        const results = await Promise.all(
          watchlist.map(async (item) => {
            let details;
            if (item.media_type === "tv") {
              details = await tmdbService.getTVShowDetails(item.movie_id);
            } else {
              details = await tmdbService.getMovieDetails(item.movie_id);
            }
            return { ...details, media_type: item.media_type, id: item.movie_id };
          })
        );
        if (!cancelled) setDetailedItems(results);
      } catch (e) {
        if (!cancelled) setDetailedItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (watchlist.length > 0) {
      fetchDetails();
    } else {
      setDetailedItems([]);
    }
    return () => {
      cancelled = true;
    };
  }, [watchlist]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Watchlist</h2>
      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : detailedItems.length === 0 ? (
        <p className="text-gray-400">Your watchlist is empty.</p>
      ) : (
        <MovieGrid
          movies={detailedItems}
          onRemove={(id) => {
            const item = watchlist.find((w) => w.movie_id === id);
            if (item) removeFromWatchlist(id, item.media_type);
          }}
          showRemoveButton
        />
      )}
    </div>
  );
}
