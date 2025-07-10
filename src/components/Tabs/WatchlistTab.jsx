import { useWatchlist } from "../../contexts/WatchlistContext";
import MovieGrid from "../MovieGrid/MovieGrid";

export default function WatchlistTab() {
  const { watchlist, removeFromWatchlist } = useWatchlist();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">My Watchlist</h2>
      {watchlist.length === 0 ? (
        <p className="text-gray-400">Your watchlist is empty.</p>
      ) : (
        <MovieGrid
          movies={watchlist}
          onRemove={removeFromWatchlist}
          showRemoveButton
        />
      )}
    </div>
  );
}
