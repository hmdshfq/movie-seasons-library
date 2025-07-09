import { useState, useEffect } from "react";
import { Search, Shuffle } from "lucide-react";
import { useMovies } from "../../hooks/useMovies";
import { useDebounce } from "../../hooks/useDebounce";
import MovieGrid from "../MovieGrid/MovieGrid";
import LoadingSpinner from "../UI/LoadingSpinner";
import Button from "../UI/Button";
import RatingSlider from "../UI/RatingSlider";
import { GENRES, YEARS, SORT_OPTIONS } from "../../utils/constants";

export default function DiscoverTab({ announce, showMovieDetails }) {
  const { movies, loading, discoverMovies, searchMovies, getRandomMovie } =
    useMovies();
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
      handleSearch();
    } else {
      applyFilters();
    }
  }, [debouncedSearch]);

  // Apply filters when debounced rating changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      applyFiltersWithDebouncedRating();
    }
  }, [debouncedRating]);

  const applyFiltersWithDebouncedRating = async () => {
    const filtersWithDebouncedRating = {
      ...filters,
      minRating: debouncedRating,
    };
    announce("Searching for movies...");
    const results = await discoverMovies(filtersWithDebouncedRating);
    announce(`Found ${results.length} results`);
  };

  const applyFilters = async () => {
    // Clear search query when applying filters
    if (searchQuery.trim()) {
      setSearchQuery("");
    }
    announce("Searching for movies...");
    const results = await discoverMovies(filters);
    announce(`Found ${results.length} results`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      applyFilters();
      return;
    }

    announce(`Searching for ${searchQuery}...`);
    const results = await searchMovies(searchQuery, filters.mediaType);
    announce(`Found ${results.length} results for "${searchQuery}"`);
  };

  const handleRandomPick = async () => {
    announce("Getting random suggestions...");
    const movies = await getRandomMovie(filters.mediaType);
    if (movies && movies.length > 0) {
      announce(
        `Found ${movies.length} random ${filters.mediaType === "tv" ? "TV shows" : "movies"}`,
      );
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
      applyFilters();
    }
  }, [filters.mediaType, filters.genre, filters.year, filters.sortBy]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label
                htmlFor="media-type"
                className="block text-sm font-medium text-gray-400 mb-2"
              >
                Type
              </label>
              <select
                id="media-type"
                value={filters.mediaType}
                onChange={(e) =>
                  handleFilterChange("mediaType", e.target.value)
                }
                className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
              >
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
              </select>
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
                {GENRES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
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
              onClick={applyFilters}
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
        <MovieGrid movies={movies} onMovieClick={showMovieDetails} />
      )}
    </section>
  );
}
