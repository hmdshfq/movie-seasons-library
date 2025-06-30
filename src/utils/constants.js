// API Configuration
export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const IMG_BASE_URL_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// App Configuration
export const MAX_PROFILES_PER_USER = 5;
export const DEFAULT_AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444'
];

// Genres
export const GENRES = [
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

// Years
export const YEARS = [
  { value: '', label: 'All Years' },
  { value: '2025', label: '2025' },
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

// Sort Options
export const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'revenue.desc', label: 'Highest Revenue' }
];

// Kids Content Filters
export const KIDS_SAFE_GENRES = ['16', '10751', '12', '35']; // Animation, Family, Adventure, Comedy
export const KIDS_MAX_RATING = 'PG-13';