import React, { useState, useEffect } from 'react';
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

export default function CineMatch() {
  const [activeTab, setActiveTab] = useState('discover');
  const [movies, setMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filter states
  const [mediaType, setMediaType] = useState('movie');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [minRating, setMinRating] = useState(0);

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

  const applyFilters = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
    }
    setLoading(false);
  };

  const getRandomSuggestion = async () => {
    setLoading(true);
    const randomPage = Math.floor(Math.random() * 10) + 1;
    
    try {
      const response = await fetch(`${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&page=${randomPage}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.results.length);
        setMovies([data.results[randomIndex]]);
      }
    } catch (error) {
      console.error('Error fetching random movie:', error);
    }
    setLoading(false);
  };

  const getPersonalizedRecommendations = async () => {
    if (watchedMovies.length === 0) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
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
    setLoading(false);
  };

  const showMovieDetails = async (movie) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`);
      const fullMovie = await response.json();
      setSelectedMovie(fullMovie);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
    setLoading(false);
  };

  const toggleWatched = (movie) => {
    const exists = watchedMovies.some(m => m.id === movie.id);
    
    if (exists) {
      setWatchedMovies(watchedMovies.filter(m => m.id !== movie.id));
    } else {
      setWatchedMovies([...watchedMovies, {
        id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path
      }]);
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
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-b from-slate-800 to-slate-900 backdrop-blur-lg animate-slideIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
              CineMatch
            </h1>
            <nav className="flex gap-2 bg-slate-800 p-1 rounded-full">
              {['discover', 'library', 'recommendations'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'recommendations' && ' For You'}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="animate-fadeIn">
            <div className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Filter & Discover</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    <option value="movie">Movies</option>
                    <option value="tv">TV Shows</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    {genres.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    {years.map(y => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Min Rating: {minRating}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={applyFilters}
                  className="spring-button bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/25"
                >
                  <Search size={20} /> Search
                </button>
                <button
                  onClick={getRandomSuggestion}
                  className="spring-button bg-gradient-to-r from-pink-600 to-pink-700 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg hover:shadow-pink-500/25"
                >
                  <Shuffle size={20} /> Random Pick
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-400">Finding great content for you...</p>
              </div>
            ) : (
              <MovieGrid movies={movies} onMovieClick={showMovieDetails} />
            )}
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="animate-fadeIn">
            <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">My Watched Library</h2>
              {watchedMovies.length === 0 ? (
                <p className="text-center text-gray-400 py-12">
                  Your library is empty. Start adding movies from the Discover tab!
                </p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {watchedMovies.map(movie => (
                    <div key={movie.id} className="flex-shrink-0">
                      <div
                        className="relative group cursor-pointer hover-lift"
                        onClick={() => showMovieDetails(movie)}
                      >
                        <img
                          src={movie.poster_path ? IMG_BASE_URL + movie.poster_path : 'https://via.placeholder.com/200x300'}
                          alt={movie.title}
                          className="w-32 h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatched(movie);
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity spring-button"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-center truncate w-32">{movie.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className="animate-fadeIn">
            <div className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Personalized Recommendations</h2>
              <p className="text-gray-400 mb-6">
                Based on your watched history, we think you'll love these:
              </p>
              <div className="text-center">
                <button
                  onClick={getPersonalizedRecommendations}
                  className="spring-button bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-indigo-500/25"
                >
                  ✨ Get Recommendations
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
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
          </div>
        )}
      </main>

      {/* Movie Details Modal */}
      {modalOpen && selectedMovie && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="float-right text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={selectedMovie.poster_path ? IMG_BASE_URL + selectedMovie.poster_path : 'https://via.placeholder.com/300x450'}
                alt={selectedMovie.title}
                className="w-full md:w-48 h-72 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{selectedMovie.title || selectedMovie.name}</h2>
                {selectedMovie.tagline && (
                  <p className="text-gray-400 italic mb-4">{selectedMovie.tagline}</p>
                )}
                
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star size={16} fill="currentColor" />
                    {selectedMovie.vote_average?.toFixed(1)}
                  </span>
                  {selectedMovie.runtime && <span>{selectedMovie.runtime} min</span>}
                  <span>{selectedMovie.release_date?.split('-')[0]}</span>
                </div>
                
                <p className="text-gray-300 mb-4 leading-relaxed">{selectedMovie.overview}</p>
                
                {selectedMovie.genres && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedMovie.genres.map(genre => (
                      <span
                        key={genre.id}
                        className="bg-indigo-600 px-3 py-1 rounded-full text-sm"
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
                >
                  {isWatched(selectedMovie.id) ? (
                    <>
                      <Check size={20} /> Watched
                    </>
                  ) : (
                    <>
                      <Plus size={20} /> Add to Library
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {movies.map(movie => (
        <div
          key={movie.id}
          onClick={() => onMovieClick(movie)}
          className="bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover-lift shadow-lg"
        >
          <div className="aspect-[2/3] relative overflow-hidden">
            <img
              src={movie.poster_path ? IMG_BASE_URL + movie.poster_path : 'https://via.placeholder.com/500x750?text=No+Poster'}
              alt={movie.title || movie.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">
              {movie.title || movie.name}
            </h3>
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star size={12} fill="currentColor" />
                {movie.vote_average?.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}