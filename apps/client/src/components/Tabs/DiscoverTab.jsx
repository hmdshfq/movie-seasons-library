import { useState, useEffect } from "react";
import { Search, Shuffle } from "lucide-react";
import { useMovies } from "../../hooks/useMovies";
import { useDebounce } from "../../hooks/useDebounce";
import { useProfile } from "../../hooks/useProfile";
import MovieGrid from "../MovieGrid/MovieGrid";
import LoadingSpinner from "../UI/LoadingSpinner";
import Button from "../UI/Button";
import RatingSlider from "../UI/RatingSlider";
import MediaTypeToggle from "../UI/MediaTypeToggle";
import { GENRES, YEARS, SORT_OPTIONS, HORROR_GENRE_ID } from "../../utils/constants";
import { useWatchedAndWatchlist } from "../../hooks/useWatchedAndWatchlist";

export default function DiscoverTab({ announce, showMovieDetails }) {
  const { movies, loading, discoverMovies, searchMovies, getRandomMovie } =
    useMovies();
  const { preferences } = useProfile();
  const { watched, watchlist } = useWatchedAndWatchlist();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const MOVIES_PER_PAGE = 18;
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    mediaType: "movie",
    genre: "",
    year: "",
    sortBy: "popularity.desc",
    minRating: 0,
  });

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedRating = useDebounce(filters.minRating, 300);

  useEffect(() => {
    if (debouncedSearch) {
      handleSearch(1);
    } else {
      applyFilters(1);
    }
  }, [debouncedSearch]);

  // Apply filters when debounced rating changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      applyFiltersWithDebouncedRating(1);
    }
  }, [debouncedRating]);

  const applyFiltersWithDebouncedRating = async (page = 1) => {
    setCurrentPage(page);
    const filtersWithDebouncedRating = {
      ...filters,
      minRating: debouncedRating,
    };
    announce("Searching for movies...");
    const { results, total } = await discoverMovies(
      filtersWithDebouncedRating,
      page,
      MOVIES_PER_PAGE,
    );
    setTotalResults(total || 0);
    announce(`Found ${total || (results ? results.length : 0)} results`);
  };

  const applyFilters = async (page = 1) => {
    setCurrentPage(page);
    // Clear search query when applying filters
    if (searchQuery.trim()) {
      setSearchQuery("");
    }
    announce("Searching for movies...");
    const { results, total } = await discoverMovies(
      filters,
      page,
      MOVIES_PER_PAGE,
    );
    setTotalResults(total || 0);
    announce(`Found ${total || (results ? results.length : 0)} results`);
  };

  const handleSearch = async (page = 1) => {
    setCurrentPage(page);
    if (!searchQuery.trim()) {
      applyFilters(page);
      return;
    }
    announce(`Searching for ${searchQuery}...`);
    const { results, total } = await searchMovies(
      searchQuery,
      filters.mediaType,
      page,
      MOVIES_PER_PAGE,
    );
    setTotalResults(total || 0);
    announce(
      `Found ${total || (results ? results.length : 0)} results for "${searchQuery}"`,
    );
  };

  const handleRandomPick = async () => {
    announce("Getting random suggestions...");
    let movies = await getRandomMovie(filters.mediaType);
    // Filter out watched and watchlist movies
    if (movies && (watched.length > 0 || watchlist.length > 0)) {
      const watchedIds = new Set(watched.map((m) => `${m.movie_id}-${m.media_type || 'movie'}`));
      const watchlistIds = new Set(watchlist.map((m) => `${m.movie_id}-${m.media_type || 'movie'}`));
      movies = movies.filter((movie) => {
        const id = `${movie.id}-${movie.media_type || 'movie'}`;
        return !watchedIds.has(id) && !watchlistIds.has(id);
      });
    }
    if (movies && movies.length > 0) {
      announce(
        `Found ${movies.length} random ${filters.mediaType === "tv" ? "TV shows" : "movies"}`,
      );
    } else {
      announce("No new random movies or shows found (all are watched or in your watchlist)");
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (value) => {
    setFilters((prev) => ({ ...prev, minRating: value }));
  };

  // Apply filters when they change (only if not searching, excluding minRating which is debounced separately)
  useEffect(() => {
    if (!searchQuery.trim()) {
      applyFilters(1);
    }
  }, [filters.mediaType, filters.genre, filters.year, filters.sortBy]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.mediaType,
    filters.genre,
    filters.year,
    filters.sortBy,
    searchQuery,
  ]);

  return (
    <section
      className="animate-fadeIn"
      aria-label="Discover movies and TV shows"
    >
      <div className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Search & Discover</h2>

        {/* Search Bar */}
        <div className="mb-6">
          <label htmlFor="search-input" className="sr-only">
            Search for movies or TV shows by name
          </label>
          <div className="relative max-w-2xl mx-auto">
            <input
              id="search-input"
              type="text"
              placeholder="Search for movies or TV shows by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-slate-700 rounded-full border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all text-white placeholder-gray-400"
              aria-describedby="search-help"
            />
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
              aria-hidden="true"
            />
          </div>
          <p id="search-help" className="sr-only">
            Type a movie or TV show name to search
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-sm text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search query"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <MediaTypeToggle
                value={filters.mediaType}
                onChange={(val) => handleFilterChange("mediaType", val)}
              />
            </div>

            <div>
              <label
                htmlFor="genre-select"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Genre
              </label>
              <select
                id="genre-select"
                value={filters.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
              >
                {GENRES.map((g) => {
                  // Hide Horror genre if hide_horror preference is enabled
                  if (preferences?.hide_horror && g.id === HORROR_GENRE_ID) {
                    return null;
                  }
                  return (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label
                htmlFor="year-select"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Year
              </label>
              <select
                id="year-select"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
              >
                {YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sort-select"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Sort By
              </label>
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <RatingSlider
                value={filters.minRating}
                onChange={handleRatingChange}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => applyFilters(1)}
              variant="primary"
              icon={Search}
              aria-label="Apply filters to search"
            >
              Apply Filters
            </Button>
            <Button
              onClick={handleRandomPick}
              variant="secondary"
              icon={Shuffle}
              aria-label="Get random movie suggestions"
            >
              Random Pick
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Finding great content for you..." />
      ) : (
        <>
          <MovieGrid movies={movies} onMovieClick={showMovieDetails} />
          {/* Pagination Controls */}
          {totalResults > MOVIES_PER_PAGE && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    searchQuery.trim()
                      ? handleSearch(currentPage - 1)
                      : applyFilters(currentPage - 1);
                  }
                }}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === 1 ? "bg-slate-700 text-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="mx-2 text-gray-300">
                Page {currentPage} of{" "}
                {Math.ceil(totalResults / MOVIES_PER_PAGE)}
              </span>
              <button
                onClick={() => {
                  if (currentPage < Math.ceil(totalResults / MOVIES_PER_PAGE)) {
                    searchQuery.trim()
                      ? handleSearch(currentPage + 1)
                      : applyFilters(currentPage + 1);
                  }
                }}
                disabled={
                  currentPage === Math.ceil(totalResults / MOVIES_PER_PAGE)
                }
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === Math.ceil(totalResults / MOVIES_PER_PAGE) ? "bg-slate-700 text-gray-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
