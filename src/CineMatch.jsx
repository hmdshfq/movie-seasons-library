import React, { useState, useEffect, useRef } from 'react';
import { Search, Shuffle, Star, X, Plus, Check, Film, Tv } from 'lucide-react';

// IMPORTANT: Replace with your TMDB API key
const API_KEY = 'ebf5aec1a4d9dc75d8a30a7429fa6005';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const genres = [
  { id: '', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
  { id: '36', name: 'History' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Science Fiction' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' }
];

const years = [
  { value: '', label: 'All Years' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2021', label: '2021' },
  { value: '2020', label: '2020' },
  { value: '2010-2019', label: '2010s' },
  { value: '2000-2009', label: '2000s' },
  { value: '1990-1999', label: '1990s' },
  { value: '1980-1989', label: '1980s' }
];

const sortOptions = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'revenue.desc', label: 'Highest Revenue' }
];

// Skip to main content link component
function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-indigo-600 text-white px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  );
}

export default function CineMatch() {
  const [activeTab, setActiveTab] = useState('discover');
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  // Filter states
  const [mediaType, setMediaType] = useState('movie');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Refs for focus management
  const modalRef = useRef(null);
  const modalCloseRef = useRef(null);
  const searchInputRef = useRef(null);

  // Announce changes to screen readers
  const announce = (message) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 100);
  };

  // Load watched movies from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('watchedMovies');
    if (stored) {
      setWatchedMovies(JSON.parse(stored));
    }
  }, []);

  // Save watched movies to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
  }, [watchedMovies]);

  // Focus management for modal
  useEffect(() => {
    if (modalOpen && modalCloseRef.current) {
      modalCloseRef.current.focus();
    }
  }, [modalOpen]);

  // Trap focus in modal
  useEffect(() => {
    if (!modalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
      }
      
      if (e.key === 'Tab' && modalRef.current) {
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen]);

  const applyFilters = async () => {
    setLoading(true);
    announce('Searching for movies...');
    let url = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&sort_by=${sortBy}&vote_average.gte=${minRating}&vote_count.gte=100`;

    if (genre) url += `&with_genres=${genre}`;
    
    if (year) {
      if (year.includes('-')) {
        const [start, end] = year.split('-');
        url += `&primary_release_date.gte=${start}-01-01&primary_release_date.lte=${end}-12-31`;
      } else {
        url += `&primary_release_year=${year}`;
      }
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      setMovies(data.results || []);
      announce(`Found ${data.results?.length || 0} results`);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
      announce('Error loading movies. Please try again.');
    }
    setLoading(false);
  };

  const searchMovies = async () => {
    if (!searchQuery.trim()) {
      applyFilters();
      return;
    }

    setLoading(true);
    announce(`Searching for ${searchQuery}...`);
    const url = `${BASE_URL}/search/${mediaType}?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setMovies(data.results || []);
      announce(`Found ${data.results?.length || 0} results for "${searchQuery}"`);
    } catch (error) {
      console.error('Error searching movies:', error);
      setMovies([]);
      announce('Error searching movies. Please try again.');
    }
    setLoading(false);
  };

  const getRandomSuggestion = async () => {
    setLoading(true);
    announce('Getting random suggestion...');
    const randomPage = Math.floor(Math.random() * 10) + 1;
    
    try {
      const response = await fetch(`${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&page=${randomPage}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.results.length);
        setMovies([data.results[randomIndex]]);
        announce(`Found random movie: ${data.results[randomIndex].title || data.results[randomIndex].name}`);
      }
    } catch (error) {
      console.error('Error fetching random movie:', error);
      announce('Error getting random suggestion. Please try again.');
    }
    setLoading(false);
  };

  const getPersonalizedRecommendations = async () => {
    if (watchedMovies.length === 0) {
      setRecommendations([]);
      announce('Please add movies to your library first to get recommendations.');
      return;
    }

    setLoading(true);
    announce('Getting personalized recommendations...');
    const recommendationSet = new Set();
    
    // Get recommendations based on last 5 watched movies
    for (const movie of watchedMovies.slice(-5)) {
      try {
        const response = await fetch(`${BASE_URL}/movie/${movie.id}/recommendations?api_key=${API_KEY}`);
        const data = await response.json();
        if (data.results) {
          data.results.slice(0, 4).forEach(rec => {
            recommendationSet.add(JSON.stringify(rec));
          });
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    }

    const uniqueRecommendations = Array.from(recommendationSet).map(r => JSON.parse(r));
    setRecommendations(uniqueRecommendations);
    announce(`Found ${uniqueRecommendations.length} recommendations based on your library`);
    setLoading(false);
  };

  const showMovieDetails = async (movie) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`);
      const fullMovie = await response.json();
      setSelectedMovie(fullMovie);
      setModalOpen(true);
      announce(`Opened details for ${fullMovie.title || fullMovie.name}`);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      announce('Error loading movie details. Please try again.');
    }
    setLoading(false);
  };

  const toggleWatched = (movie) => {
    const exists = watchedMovies.some(m => m.id === movie.id);
    
    if (exists) {
      setWatchedMovies(watchedMovies.filter(m => m.id !== movie.id));
      announce(`Removed ${movie.title || movie.name} from your library`);
    } else {
      setWatchedMovies([...watchedMovies, {
        id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path
      }]);
      announce(`Added ${movie.title || movie.name} to your library`);
    }
  };

  const isWatched = (movieId) => {
    return watchedMovies.some(m => m.id === movieId);
  };

  // Initialize with popular movies
  useEffect(() => {
    applyFilters();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100">
      <SkipToMain />
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        .animate-spin {
          animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
        }
        
        .hover-lift {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        
        .spring-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .spring-button:hover {
          transform: translateY(-3px) scale(1.05);
        }
        
        .spring-button:active {
          transform: translateY(-1px) scale(0.98);
        }
        
        /* Focus styles */
        *:focus {
          outline: none;
        }
        
        *:focus-visible {
          outline: 2px solid #818cf8;
          outline-offset: 2px;
        }
        
        /* Screen reader only */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .not-sr-only {
          position: static;
          width: auto;
          height: auto;
          padding: 0;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>

      {/* Live Region for Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-800 to-slate-900 backdrop-blur-lg animate-slideIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
              CineMatch
            </h1>
            <nav role="navigation" aria-label="Main navigation">
              <ul className="flex gap-2 bg-slate-800 p-1 rounded-full">
                {[
                  { id: 'discover', label: 'Discover' },
                  { id: 'library', label: 'My Library' },
                  { id: 'recommendations', label: 'For You' }
                ].map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => {
                        setActiveTab(tab.id);
                        announce(`Switched to ${tab.label} tab`);
                      }}
                      className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white'
                      }`}
                      aria-current={activeTab === tab.id ? 'page' : undefined}
                      aria-label={tab.label}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <section className="animate-fadeIn" aria-label="Discover movies and TV shows">
            <div className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Search & Discover</h2>
              
              {/* Search Bar */}
              <div className="mb-6">
                <label htmlFor="search-input" className="sr-only">
                  Search for movies or TV shows by name
                </label>
                <div className="relative max-w-2xl mx-auto">
                  <input
                    ref={searchInputRef}
                    id="search-input"
                    type="text"
                    placeholder="Search for movies or TV shows by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
                    className="w-full px-4 py-3 pl-12 bg-slate-700 rounded-full border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all text-white placeholder-gray-400"
                    aria-describedby="search-help"
                  />
                  <Search 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    size={20}
                    aria-hidden="true"
                  />
                  <button
                    onClick={searchMovies}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 spring-button bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-indigo-700"
                    aria-label="Search for movies"
                  >
                    Search
                  </button>
                </div>
                <p id="search-help" className="sr-only">
                  Type a movie or TV show name and press Enter or click Search
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      applyFilters();
                      announce('Search cleared');
                    }}
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
                    <label htmlFor="media-type" className="block text-sm font-medium text-gray-400 mb-2">
                      Type
                    </label>
                    <select
                      id="media-type"
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                      aria-label="Select media type"
                    >
                      <option value="movie">Movies</option>
                      <option value="tv">TV Shows</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="genre-select" className="block text-sm font-medium text-gray-400 mb-2">
                      Genre
                    </label>
                    <select
                      id="genre-select"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                      aria-label="Select genre"
                    >
                      {genres.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="year-select" className="block text-sm font-medium text-gray-400 mb-2">
                      Year
                    </label>
                    <select
                      id="year-select"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                      aria-label="Select year"
                    >
                      {years.map(y => (
                        <option key={y.value} value={y.value}>{y.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="sort-select" className="block text-sm font-medium text-gray-400 mb-2">
                      Sort By
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                      aria-label="Sort results by"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="rating-slider" className="block text-sm font-medium text-gray-400 mb-2">
                      Min Rating: {minRating}
                    </label>
                    <input
                      id="rating-slider"
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="w-full"
                      aria-label="Minimum rating"
                      aria-valuemin="0"
                      aria-valuemax="10"
                      aria-valuenow={minRating}
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={applyFilters}
                    className="spring-button bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25"
                    aria-label="Apply filters to search"
                  >
                    <Search size={20} aria-hidden="true" /> Apply Filters
                  </button>
                  <button
                    onClick={getRandomSuggestion}
                    className="spring-button bg-gradient-to-r from-pink-600 to-pink-700 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:shadow-pink-500/25"
                    aria-label="Get random movie suggestion"
                  >
                    <Shuffle size={20} aria-hidden="true" /> Random Pick
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12" role="status" aria-label="Loading movies">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-400">Finding great content for you...</p>
              </div>
            ) : (
              <MovieGrid movies={movies} onMovieClick={showMovieDetails} />
            )}
          </section>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <section className="animate-fadeIn" aria-label="Your watched library">
            <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">My Watched Library</h2>
              {watchedMovies.length === 0 ? (
                <p className="text-center text-gray-400 py-12">
                  Your library is empty. Start adding movies from the Discover tab!
                </p>
              ) : (
                <div 
                  className="flex gap-4 overflow-x-auto pb-4"
                  role="list"
                  aria-label="Watched movies"
                >
                  {watchedMovies.map(movie => (
                    <div 
                      key={movie.id} 
                      className="flex-shrink-0"
                      role="listitem"
                    >
                      <div
                        className="relative group cursor-pointer hover-lift"
                        onClick={() => showMovieDetails(movie)}
                        onKeyPress={(e) => e.key === 'Enter' && showMovieDetails(movie)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View details for ${movie.title}`}
                      >
                        <img
                          src={movie.poster_path ? IMG_BASE_URL + movie.poster_path : 'https://via.placeholder.com/200x300'}
                          alt={`${movie.title} poster`}
                          className="w-32 h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatched(movie);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity spring-button"
                          aria-label={`Remove ${movie.title} from library`}
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-center truncate w-32">{movie.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <section className="animate-fadeIn" aria-label="Personalized recommendations">
            <div className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Personalized Recommendations</h2>
              <p className="text-gray-400 mb-6">
                Based on your watched history, we think you'll love these:
              </p>
              <div className="text-center">
                <button
                  onClick={getPersonalizedRecommendations}
                  className="spring-button bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-indigo-500/25"
                  aria-label="Get personalized movie recommendations"
                >
                  <span aria-hidden="true">✨</span> Get Recommendations
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12" role="status" aria-label="Loading recommendations">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-400">Analyzing your preferences...</p>
              </div>
            ) : watchedMovies.length === 0 ? (
              <p className="text-center text-gray-400 py-12">
                Add some movies to your library first to get personalized recommendations!
              </p>
            ) : (
              <MovieGrid movies={recommendations} onMovieClick={showMovieDetails} />
            )}
          </section>
        )}
      </main>

      {/* Movie Details Modal */}
      {modalOpen && selectedMovie && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            ref={modalRef}
            className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={modalCloseRef}
              onClick={() => setModalOpen(false)}
              className="float-right text-gray-400 hover:text-white transition-colors p-2 -m-2"
              aria-label="Close movie details"
            >
              <X size={24} aria-hidden="true" />
            </button>
            
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={selectedMovie.poster_path ? IMG_BASE_URL + selectedMovie.poster_path : 'https://via.placeholder.com/300x450'}
                alt={`${selectedMovie.title || selectedMovie.name} poster`}
                className="w-full md:w-48 h-72 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h2 id="modal-title" className="text-2xl font-bold mb-2">
                  {selectedMovie.title || selectedMovie.name}
                </h2>
                {selectedMovie.tagline && (
                  <p className="text-gray-400 italic mb-4">{selectedMovie.tagline}</p>
                )}
                
                <div className="flex items-center gap-4 mb-4 text-sm" role="list">
                  <span className="flex items-center gap-1 text-amber-400" role="listitem">
                    <Star size={16} fill="currentColor" aria-hidden="true" />
                    <span aria-label={`Rating: ${selectedMovie.vote_average?.toFixed(1)} out of 10`}>
                      {selectedMovie.vote_average?.toFixed(1)}
                    </span>
                  </span>
                  {selectedMovie.runtime && (
                    <span role="listitem" aria-label={`Runtime: ${selectedMovie.runtime} minutes`}>
                      {selectedMovie.runtime} min
                    </span>
                  )}
                  <span role="listitem" aria-label={`Release year: ${selectedMovie.release_date?.split('-')[0]}`}>
                    {selectedMovie.release_date?.split('-')[0]}
                  </span>
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed">{selectedMovie.overview}</p>
                
                {selectedMovie.genres && (
                  <div 
                    className="flex flex-wrap gap-2 mb-6"
                    role="list"
                    aria-label="Genres"
                  >
                    {selectedMovie.genres.map(genre => (
                      <span
                        key={genre.id}
                        className="bg-indigo-600 px-3 py-1 rounded-full text-sm"
                        role="listitem"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={() => toggleWatched(selectedMovie)}
                  className={`spring-button px-6 py-3 rounded-full font-semibold flex items-center gap-2 ${
                    isWatched(selectedMovie.id)
                      ? 'bg-pink-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                  aria-label={
                    isWatched(selectedMovie.id)
                      ? `Remove ${selectedMovie.title || selectedMovie.name} from library`
                      : `Add ${selectedMovie.title || selectedMovie.name} to library`
                  }
                >
                  {isWatched(selectedMovie.id) ? (
                    <>
                      <Check size={20} aria-hidden="true" /> Watched
                    </>
                  ) : (
                    <>
                      <Plus size={20} aria-hidden="true" /> Add to Library
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Movie Grid Component
function MovieGrid({ movies, onMovieClick }) {
  if (!movies || movies.length === 0) {
    return (
      <p className="text-center text-gray-400 py-12">
        No results found. Try different filters!
      </p>
    );
  }

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      role="list"
      aria-label="Movie results"
    >
      {movies.map(movie => (
        <article
          key={movie.id}
          onClick={() => onMovieClick(movie)}
          onKeyPress={(e) => e.key === 'Enter' && onMovieClick(movie)}
          className="bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover-lift shadow-lg"
          tabIndex={0}
          role="listitem"
          aria-label={`${movie.title || movie.name}, rated ${movie.vote_average?.toFixed(1)} out of 10`}
        >
          <div className="aspect-[2/3] relative overflow-hidden">
            <img
              src={movie.poster_path ? IMG_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster'}
              alt={`${movie.title || movie.name} poster`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              loading="lazy"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {movie.title || movie.name}
            </h3>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star size={12} fill="currentColor" aria-hidden="true" />
                <span>{movie.vote_average?.toFixed(1)}</span>
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}