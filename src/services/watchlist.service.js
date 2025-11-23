import { api } from '../lib/api';

export const watchlistService = {
  async getWatchlist() {
    return api.get('/api/watchlist');
  },

  async addToWatchlist(movie) {
    try {
      return await api.post('/api/watchlist', {
        movie_id: movie.id,
        media_type: movie.media_type || 'movie',
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

  async removeFromWatchlist(movieId, mediaType = 'movie') {
    return api.delete(`/api/watchlist/${movieId}?media_type=${mediaType}`);
  },

  async isInWatchlist(movieId, mediaType = 'movie') {
    const result = await api.get(`/api/watchlist/${movieId}/check?media_type=${mediaType}`);
    return result.inWatchlist;
  }
};
