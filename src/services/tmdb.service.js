import tmdb from '../lib/tmdb';
import { KIDS_SAFE_GENRES } from '../utils/constants';

export const tmdbService = {
  async getMovieDetails(movieId) {
    return tmdb.getMovie(movieId);
  },

  async getTVShowDetails(tvId) {
    return tmdb.getTVShow(tvId);
  },

  async searchMovies(query, isKidsProfile = false) {
    const results = await tmdb.searchMovies(query);

    if (isKidsProfile) {
      return filterKidsContent(results.results);
    }

    return results.results;
  },

  async searchTVShows(query, isKidsProfile = false) {
    const results = await tmdb.searchTVShows(query);

    if (isKidsProfile) {
      return filterKidsContent(results.results);
    }

    return results.results;
  },

  async discoverMovies(params, isKidsProfile = false) {
    const modifiedParams = { ...params };

    if (isKidsProfile) {
      modifiedParams.with_genres = KIDS_SAFE_GENRES.join(',');
      modifiedParams.certification_country = 'US';
      modifiedParams['certification.lte'] = 'PG-13';
    }

    const results = await tmdb.discoverMovies(modifiedParams);
    return results.results;
  },

  async discoverTVShows(params, isKidsProfile = false) {
    const modifiedParams = { ...params };

    if (isKidsProfile) {
      modifiedParams.with_genres = KIDS_SAFE_GENRES.join(',');
    }

    const results = await tmdb.discoverTVShows(modifiedParams);
    return results.results;
  },

  async getRecommendations(movieId, isKidsProfile = false) {
    const results = await tmdb.getMovieRecommendations(movieId);

    if (isKidsProfile) {
      return filterKidsContent(results.results);
    }

    return results.results;
  },

  async getGenres(type = 'movie') {
    return type === 'movie'
      ? tmdb.getMovieGenres()
      : tmdb.getTVGenres();
  }
};

function filterKidsContent(items) {
  return items.filter(item => {
    // Filter by genre
    if (item.genre_ids) {
      const hasKidsSafeGenre = item.genre_ids.some(id =>
        KIDS_SAFE_GENRES.includes(id.toString())
      );
      if (!hasKidsSafeGenre) return false;
    }

    // Filter by rating (if available)
    if (item.vote_average && item.vote_average > 7) {
      return true;
    }

    return true;
  });
}