import { useState, useEffect } from "react";
import SkipToMain from "../components/Layout/SkipToMain";
import Header from "../components/Layout/Header";
import ApiNotice from "../components/UI/ApiNotice";
import DiscoverTab from "../components/Tabs/DiscoverTab";
import LibraryTab from "../components/Tabs/LibraryTab";
import MovieDetailsModal from "../components/Modal/MovieDetailsModal";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAnnouncements } from "../hooks/useAnnouncements";
import tmdbService from "../services/tmdb";
import "../styles/animations.css";

export default function MovieLibrary() {
  const [activeTab, setActiveTab] = useState("discover");
  const [watchedMovies, setWatchedMovies] = useLocalStorage(
    "watchedMovies",
    []
  );
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { announcement, announce } = useAnnouncements();

  const showMovieDetails = async (movie) => {
    try {
      const fullMovie = await tmdbService.getMovieDetails(movie.id);
      setSelectedMovie(fullMovie);
      setModalOpen(true);
      announce(`Opened details for ${fullMovie.title || fullMovie.name}`);
    } catch (error) {
      console.error("Error fetching movie details:", error);
      announce("Error loading movie details. Please try again.");
    }
  };

  const toggleWatched = (movie) => {
    const exists = watchedMovies.some((m) => m.id === movie.id);

    if (exists) {
      setWatchedMovies(watchedMovies.filter((m) => m.id !== movie.id));
      announce(`Removed ${movie.title || movie.name} from your library`);
    } else {
      setWatchedMovies([
        ...watchedMovies,
        {
          id: movie.id,
          title: movie.title || movie.name,
          poster_path: movie.poster_path,
        },
      ]);
      announce(`Added ${movie.title || movie.name} to your library`);
    }
  };

  const isWatched = (movieId) => {
    return watchedMovies.some((m) => m.id === movieId);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      <SkipToMain />

      {/* Live Region for Announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only">
        {announcement}
      </div>

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        announce={announce}
      />

      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApiNotice />

        {activeTab === "discover" && (
          <DiscoverTab
            announce={announce}
            showMovieDetails={showMovieDetails}
          />
        )}

        {activeTab === "library" && (
          <LibraryTab
            watchedMovies={watchedMovies}
            showMovieDetails={showMovieDetails}
            toggleWatched={toggleWatched}
          />
        )}
      </main>

      <MovieDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        movie={selectedMovie}
        isWatched={isWatched}
        onToggleWatched={toggleWatched}
      />
    </div>
  );
}
