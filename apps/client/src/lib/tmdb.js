import { API_KEY, BASE_URL } from '../utils/constants';

class TMDBClient {
  constructor() {
    this.apiKey = API_KEY;
    this.baseUrl = BASE_URL;
  }

  async request(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('api_key', this.apiKey);

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