const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

class TMDBClient {
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/tmdb`;
  }

  async request(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    return response.json();
  }

  // Movie methods
  async getMovie(movieId) {
    return this.request(`/movie/${movieId}`);
  }

  async searchMovies(query, page = 1) {
    return this.request('/search/movie', { query, page });
  }

  async discoverMovies(params) {
    return this.request('/discover/movie', params);
  }

  async getMovieRecommendations(movieId) {
    return this.request(`/movie/${movieId}/recommendations`);
  }

  // TV methods
  async getTVShow(tvId) {
    return this.request(`/tv/${tvId}`);
  }

  async searchTVShows(query, page = 1) {
    return this.request('/search/tv', { query, page });
  }

  async discoverTVShows(params) {
    return this.request('/discover/tv', params);
  }

  // Multi-search
  async searchMulti(query) {
    return this.request('/search/multi', { query });
  }

  // Genres
  async getMovieGenres() {
    return this.request('/genre/movie/list');
  }

  async getTVGenres() {
    return this.request('/genre/tv/list');
  }
}

export default new TMDBClient();