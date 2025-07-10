import DiscoverTab from "../components/Tabs/DiscoverTab";
import LibraryTab from "../components/Tabs/LibraryTab";
import RecommendationsTab from "../components/Tabs/RecommendationsTab";
import MovieDetailsModal from "../components/Modal/MovieDetailsModal";
import { useState, useEffect } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { tmdbService } from "../services/tmdb.service";
import { movieService } from "../services/movie.service";

export default function Home() {
  const { activeTab, announce } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const tabFromPath = () => {
    if (location.pathname === "/library") return "library";
    if (location.pathname === "/recommendations") return "recommendations";
    return "discover";
  };
  const [tab, setTab] = useState(tabFromPath());

  // Sync tab with route
  useEffect(() => {
    setTab(tabFromPath());
  }, [location.pathname]);
  const { profile } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [watchedMovies, setWatchedMovies] = useState([]);

  const showMovieDetails = async (movie) => {
    try {
      const fullMovie = await tmdbService.getMovieDetails(movie.id);
      setSelectedMovie(fullMovie);
      setModalOpen(true);

      // Fetch watched status
      if (profile) {
        const watched = await movieService.getWatchedMovies(profile.id);
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
        await movieService.removeWatchedMovie(profile.id, movie.id);
        setWatchedMovies((prev) => prev.filter((m) => m.movie_id !== movie.id));
        announce(`Removed ${movie.title || movie.name} from your library`);
      } else {
        await movieService.addWatchedMovie(profile.id, movie);
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
      {tab === "discover" && (
        <DiscoverTab announce={announce} showMovieDetails={showMovieDetails} />
      )}

      {tab === "library" && <LibraryTab showMovieDetails={showMovieDetails} />}

      {tab === "recommendations" && (
        <RecommendationsTab
          showMovieDetails={showMovieDetails}
          announce={announce}
        />
      )}

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
