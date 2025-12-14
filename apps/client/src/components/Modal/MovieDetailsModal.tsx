import { useEffect, useRef, useState } from "react";
import { useWatchlist } from "../../contexts/WatchlistContext";
import { X, Star, Plus, Check, Calendar, Clock, Play, Bookmark, Eye } from "lucide-react";
import Button from "../UI/Button";
import { IMG_BASE_URL } from "../../utils/constants";
import tmdbClient from "../../lib/tmdb";

export default function MovieDetailsModal({
  isOpen,
  onClose,
  movie,
  isWatched,
  onToggleWatched,
  onRemoveMovie,
}) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const modalRef = useRef(null);
  const closeRef = useRef(null);
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (isOpen && closeRef.current) {
      closeRef.current.focus();
    }
  }, [isOpen]);

  // Fetch trailer when modal opens
  useEffect(() => {
    if (!isOpen || !movie) return;

    const fetchTrailer = async () => {
      try {
        const mediaType =
          movie.media_type || (movie.first_air_date ? "tv" : "movie");
        let videos;

        if (mediaType === "tv") {
          videos = await tmdbClient.getTVVideos(movie.id);
        } else {
          videos = await tmdbClient.getMovieVideos(movie.id);
        }

        // Find the first YouTube trailer
        const trailerData = videos?.results?.find(
          (video) => video.type === "Trailer" && video.site === "YouTube"
        );

        console.log("Trailer data:", trailerData);
        setTrailer(trailerData || null);
        setShowTrailer(false);
      } catch (error) {
        console.error("Failed to fetch trailer:", error);
        setTrailer(null);
      }
    };

    fetchTrailer();
  }, [isOpen, movie]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title">
      <div
        ref={modalRef}
        className="relative bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        {/* Background poster */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              movie.poster_path
                ? IMG_BASE_URL + movie.poster_path
                : movie.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : "https://placehold.co/300x450"
            }
            alt={`${movie.title || movie.name} poster`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800/95 to-slate-900/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 overflow-y-auto flex-1">
          <button
            ref={closeRef}
            onClick={() => {
              if (showTrailer) {
                setShowTrailer(false);
              } else {
                onClose();
              }
            }}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 rounded-full text-white hover:bg-slate-900 transition-colors cursor-pointer z-10"
            aria-label="Close movie details">
            <X size={24} />
          </button>
          <div className="flex flex-col gap-6 relative">
            {/* Poster Card on Left with Action Buttons */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <img
                  src={
                    movie.poster_path
                      ? IMG_BASE_URL + movie.poster_path
                      : "https://placehold.co/300x450"
                  }
                  alt={`${movie.title || movie.name} poster`}
                  className="w-32 h-48 md:w-40 md:h-56 object-cover rounded-lg shadow-2xl"
                />
                {/* Action Buttons - Positioned on large screens */}
                <div className="hidden lg:flex flex-col gap-3 absolute top-28 right-0">
                  <Button
                    onClick={async () => {
                      await onToggleWatched(movie);
                      // Delay modal close to allow animation to play
                      setTimeout(onClose, 300);
                    }}
                    variant={isWatched(movie.id) ? "secondary" : "primary"}
                    icon={isWatched(movie.id) ? Check : Eye}
                    fullWidth>
                    {isWatched(movie.id) ? "Watched" : "Watched"}
                  </Button>
                  <Button
                    onClick={async () => {
                      if (isInWatchlist(movie.id)) {
                        await removeFromWatchlist(
                          movie.id,
                          movie.media_type ||
                            (movie.first_air_date ? "tv" : "movie")
                        );
                        onClose();
                      } else {
                        onRemoveMovie?.(movie.id);
                        await addToWatchlist({
                          ...movie,
                          media_type:
                            movie.media_type ||
                            (movie.first_air_date ? "tv" : "movie"),
                        });
                        // Delay modal close to allow animation to play
                        setTimeout(onClose, 300);
                      }
                    }}
                    variant={isInWatchlist(movie.id) ? "secondary" : "primary"}
                    icon={isInWatchlist(movie.id) ? Check : Bookmark}
                    fullWidth>
                    {isInWatchlist(movie.id) ? "Watchlist" : "Watchlist"}
                  </Button>
                </div>
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

                  {movie.episode_run_time &&
                    movie.episode_run_time.length > 0 && (
                      <span className="flex items-center gap-1 text-gray-300">
                        <Clock size={16} />
                        {movie.episode_run_time[0]} min/ep
                      </span>
                    )}

                  {movie.release_date && (
                    <span className="flex items-center gap-1 text-gray-300">
                      <Calendar size={16} />
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  )}

                  {movie.first_air_date && (
                    <span className="flex items-center gap-1 text-gray-300">
                      <Calendar size={16} />
                      {new Date(movie.first_air_date).getFullYear()}
                    </span>
                  )}

                  {movie.vote_count && (
                    <span className="text-gray-400">
                      ({movie.vote_count.toLocaleString()} votes)
                    </span>
                  )}
                </div>

                {/* Genres Section */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="bg-indigo-600/20 border border-indigo-600/50 px-3 py-1 rounded-full text-sm text-indigo-300">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Overview Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-gray-300 leading-relaxed">
                {movie.overview || "No overview available."}
              </p>
            </div>

            {/* Action Buttons - Only show on small/medium screens */}
            <div className="lg:hidden flex gap-4">
              <Button
                onClick={async () => {
                  await onToggleWatched(movie);
                  // Delay modal close to allow animation to play
                  setTimeout(onClose, 300);
                }}
                variant={isWatched(movie.id) ? "secondary" : "primary"}
                icon={isWatched(movie.id) ? Check : Eye}>
                {isWatched(movie.id) ? "Watched" : "Watched"}
              </Button>
              <Button
                onClick={async () => {
                  if (isInWatchlist(movie.id)) {
                    await removeFromWatchlist(
                      movie.id,
                      movie.media_type ||
                        (movie.first_air_date ? "tv" : "movie")
                    );
                    onClose();
                  } else {
                    onRemoveMovie?.(movie.id);
                    await addToWatchlist({
                      ...movie,
                      media_type:
                        movie.media_type ||
                        (movie.first_air_date ? "tv" : "movie"),
                    });
                    // Delay modal close to allow animation to play
                    setTimeout(onClose, 300);
                  }
                }}
                variant={isInWatchlist(movie.id) ? "secondary" : "primary"}
                icon={isInWatchlist(movie.id) ? Check : Bookmark}>
                {isInWatchlist(movie.id) ? "Watchlist" : "Watchlist"}
              </Button>
            </div>

            {/* Trailer Section */}
            {showTrailer && trailer ? (
              <div>
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                    title={trailer.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            ) : trailer ? (
              <div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowTrailer(true);
                  }}
                  className="w-full aspect-video bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center group cursor-pointer hover:from-gray-700 hover:to-gray-900 transition-colors relative overflow-hidden"
                  type="button"
                  aria-label="Play trailer">
                  <img
                    src={`https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg`}
                    alt={trailer.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                  <div className="relative z-10 bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform shadow-lg">
                    <Play size={32} fill="white" className="text-white" />
                  </div>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
