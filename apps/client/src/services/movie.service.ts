import { api } from '../lib/api';

export const movieService = {
  async getWatchedMovies() {
    return api.get('/api/profile/watched-movies');
  },

  async addWatchedMovie(movie) {
    try {
      return await api.post('/api/profile/watched-movies', {
        movie_id: movie.id,
        title: movie.title || movie.name,
        poster_path: movie.poster_path
      });
    } catch (error) {
      if (error.message.includes('duplicate')) {
        return { exists: true };
      }
      throw error;
    }
  },

  async removeWatchedMovie(movieId) {
    return api.delete(`/api/profile/watched-movies/${movieId}`);
  },

  async updateMovieRating(movieId, rating) {
    return api.put(`/api/profile/watched-movies/${movieId}/rating`, { rating });
  },

  async getMovieStats() {
    return api.get('/api/profile/stats');
  }
};