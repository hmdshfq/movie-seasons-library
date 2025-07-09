import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { X, Film, Calendar, Star } from "lucide-react";
import { movieService } from "../../services/movie.service";
import LoadingSpinner from "../UI/LoadingSpinner";
import { IMG_BASE_URL } from "../../utils/constants";

export default function LibraryTab({ showMovieDetails }) {
  const { profile } = useAuth();
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("watched_at");

  useEffect(() => {
    if (profile) {
      fetchWatchedMovies();
    }
  }, [profile]);

  const fetchWatchedMovies = async () => {
    setLoading(true);
    try {
      const movies = await movieService.getWatchedMovies(profile.id);
      setWatchedMovies(movies);
    } catch (error) {
      console.error("Error fetching watched movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromLibrary = async (movieId) => {
    try {
      await movieService.removeWatchedMovie(profile.id, movieId);
      setWatchedMovies((prev) => prev.filter((m) => m.movie_id !== movieId));
    } catch (error) {
      console.error("Error removing movie:", error);
    }
  };

  const sortedMovies = [...watchedMovies].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "watched_at":
      default:
        return new Date(b.watched_at) - new Date(a.watched_at);
    }
  });

  if (loading) {
    return <LoadingSpinner message="Loading your library..." />;
  }

  return (
    <section className="animate-fadeIn" aria-label="Your watched library">
      <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Library</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
            aria-label="Sort library by"
          >
            <option value="watched_at">Recently Watched</option>
            <option value="title">Title</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {watchedMovies.length === 0 ? (
          <div className="text-center py-12">
            <Film size={64} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Your library is empty</p>
            <p className="text-gray-500 mt-2">
              Start adding movies from the Discover tab!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedMovies.map((movie) => (
              <div key={movie.id} className="relative group" role="listitem">
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    showMovieDetails({ id: movie.movie_id, title: movie.title })
                  }
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    showMovieDetails({ id: movie.movie_id, title: movie.title })
                  }
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${movie.title}`}
                >
                  <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                    <img
                      src={
                        movie.poster_path
                          ? IMG_BASE_URL + movie.poster_path
                          : "https://placehold.co/200x300"
                      }
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromLibrary(movie.movie_id);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    aria-label={`Remove ${movie.title} from library`}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-2">
                  <h3 className="text-sm font-medium truncate">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Calendar size={12} />
                    <span>
                      {new Date(movie.watched_at).toLocaleDateString()}
                    </span>
                    {movie.rating && (
                      <>
                        <Star
                          size={12}
                          className="text-amber-400 fill-current"
                        />
                        <span>{movie.rating}/5</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
