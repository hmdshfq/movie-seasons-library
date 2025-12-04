import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { tmdbService } from "../services/tmdb.service";
import { movieService } from "../services/movie.service";
import WatchlistTab from "../components/Tabs/WatchlistTab";
import MovieDetailsModal from "../components/Modal/MovieDetailsModal";

export default function Watchlist() {
  const { announce } = useOutletContext();
  const { profile } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [watchedMovies, setWatchedMovies] = useState([]);

  const showMovieDetails = async (movie, onRemove) => {
    try {
      const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
      const fullMovie = mediaType === 'tv'
        ? await tmdbService.getTVShowDetails(movie.id)
        : await tmdbService.getMovieDetails(movie.id);
      setSelectedMovie(fullMovie);
      setModalOpen(true);

      // Fetch watched status
      if (profile) {
        const watched = await movieService.getWatchedMovies();
        setWatchedMovies(watched);
      }

      announce(`Opened details for ${fullMovie.title || fullMovie.name}`);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      announce("Error loading movie details. Please try again.");
    }
  };

  const toggleWatched = async (movie) => {
    if (!profile) return;

    const isWatched = watchedMovies.some((m) => m.movie_id === movie.id);

    try {
      if (isWatched) {
        await movieService.removeWatchedMovie(movie.id);
        setWatchedMovies((prev) => prev.filter((m) => m.movie_id !== movie.id));
        announce(`Removed ${movie.title || movie.name} from your library`);
      } else {
        await movieService.addWatchedMovie(movie);
        const newMovie = {
          movie_id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
          watched_at: new Date().toISOString(),
        };
        setWatchedMovies((prev) => [...prev, newMovie]);
        announce(`Added ${movie.title || movie.name} to your library`);
      }
    } catch (error) {
      console.error("Error toggling watched status:", error);
      announce("Error updating library. Please try again.");
    }
  };

  const isWatched = (movieId) => {
    return watchedMovies.some((m) => m.movie_id === movieId);
  };

  return (
    <>
      <WatchlistTab showMovieDetails={showMovieDetails} />
      <MovieDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        movie={selectedMovie}
        isWatched={isWatched}
        onToggleWatched={toggleWatched}
      />
    </>
  );
}
