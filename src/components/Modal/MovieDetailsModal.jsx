import { useEffect, useRef } from "react";
import { useWatchlist } from "../../contexts/WatchlistContext";
import { X, Star, Plus, Check, Calendar, Clock } from "lucide-react";
import Button from "../UI/Button";
import { IMG_BASE_URL } from "../../utils/constants";

export default function MovieDetailsModal({
  isOpen,
  onClose,
  movie,
  isWatched,
  onToggleWatched,
}) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const modalRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    if (isOpen && closeRef.current) {
      closeRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !movie) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with backdrop */}
        <div>
          <img
            src={
              movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : movie.poster_path
                  ? IMG_BASE_URL + movie.poster_path
                  : "https://placehold.co/1280x720"
            }
            alt={`${movie.title || movie.name} backdrop`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800  to-slate-700/85" />
        </div>

        {/* Content */}
        <div className="relative p-6 md:p-8 overflow-y-auto flex-1">
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 rounded-full text-white hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Close movie details"
          >
            <X size={24} />
          </button>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={
                  movie.poster_path
                    ? IMG_BASE_URL + movie.poster_path
                    : "https://placehold.co/300x450"
                }
                alt={`${movie.title || movie.name} poster`}
                className="w-48 h-72 object-cover rounded-lg shadow-2xl"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h2 id="modal-title" className="text-3xl font-bold mb-2">
                {movie.title || movie.name}
              </h2>

              {movie.tagline && (
                <p className="text-gray-400 italic mb-4">{movie.tagline}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star size={18} fill="currentColor" />
                  <span className="font-semibold">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-gray-400">/ 10</span>
                </span>

                {movie.runtime && (
                  <span className="flex items-center gap-1 text-gray-300">
                    <Clock size={16} />
                    {movie.runtime} min
                  </span>
                )}

                {movie.release_date && (
                  <span className="flex items-center gap-1 text-gray-300">
                    <Calendar size={16} />
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}

                {movie.vote_count && (
                  <span className="text-gray-400">
                    ({movie.vote_count.toLocaleString()} votes)
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-gray-300 leading-relaxed">
                  {movie.overview || "No overview available."}
                </p>
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-indigo-600/20 border border-indigo-600/50 px-3 py-1 rounded-full text-sm text-indigo-300"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => onToggleWatched(movie)}
                  variant={isWatched(movie.id) ? "secondary" : "primary"}
                  icon={isWatched(movie.id) ? Check : Plus}
                >
                  {isWatched(movie.id) ? "Watched" : "Add to Library"}
                </Button>
                <Button
                  onClick={() =>
                    isInWatchlist(movie.id)
                      ? removeFromWatchlist(movie.id)
                      : addToWatchlist(movie)
                  }
                  variant={isInWatchlist(movie.id) ? "secondary" : "primary"}
                  icon={isInWatchlist(movie.id) ? Check : Plus}
                >
                  {isInWatchlist(movie.id) ? "In Watchlist" : "Add to Watchlist"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
