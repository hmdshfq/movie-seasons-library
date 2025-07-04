import tmdb from "../lib/tmdb";
import { KIDS_SAFE_GENRES } from "../utils/constants";

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

    // Map component filters to TMDB API parameters
    if (modifiedParams.mediaType === "tv") {
      delete modifiedParams.mediaType;
      return this.discoverTVShows(modifiedParams, isKidsProfile);
    }

    // Remove mediaType for movie discovery
    delete modifiedParams.mediaType;

    // Map genre filter
    if (modifiedParams.genre) {
      modifiedParams.with_genres = modifiedParams.genre;
      delete modifiedParams.genre;
    }

    // Map year filter
    if (modifiedParams.year) {
      if (modifiedParams.year.includes("-")) {
        // Handle decade ranges like "2010-2019"
        const [startYear, endYear] = modifiedParams.year.split("-");
        modifiedParams["primary_release_date.gte"] = `${startYear}-01-01`;
        modifiedParams["primary_release_date.lte"] = `${endYear}-12-31`;
      } else {
        // Handle single year
        modifiedParams.primary_release_year = modifiedParams.year;
      }
      delete modifiedParams.year;
    }

    // Map sort filter
    if (modifiedParams.sortBy) {
      modifiedParams.sort_by = modifiedParams.sortBy;
      delete modifiedParams.sortBy;
    }

    // Map rating filter
    if (modifiedParams.minRating && modifiedParams.minRating > 0) {
      modifiedParams["vote_average.gte"] = modifiedParams.minRating;
      delete modifiedParams.minRating;
    } else {
      delete modifiedParams.minRating;
    }

    if (isKidsProfile) {
      modifiedParams.with_genres = KIDS_SAFE_GENRES.join(",");
      modifiedParams.certification_country = "US";
      modifiedParams["certification.lte"] = "PG-13";
    }

    const results = await tmdb.discoverMovies(modifiedParams);
    return results.results;
  },

  async discoverTVShows(params, isKidsProfile = false) {
    const modifiedParams = { ...params };

    // Remove mediaType for TV discovery
    delete modifiedParams.mediaType;

    // Map genre filter
    if (modifiedParams.genre) {
      modifiedParams.with_genres = modifiedParams.genre;
      delete modifiedParams.genre;
    }

    // Map year filter for TV shows
    if (modifiedParams.year) {
      if (modifiedParams.year.includes("-")) {
        // Handle decade ranges like "2010-2019"
        const [startYear, endYear] = modifiedParams.year.split("-");
        modifiedParams["first_air_date.gte"] = `${startYear}-01-01`;
        modifiedParams["first_air_date.lte"] = `${endYear}-12-31`;
      } else {
        // Handle single year
        modifiedParams.first_air_date_year = modifiedParams.year;
      }
      delete modifiedParams.year;
    }

    // Map sort filter
    if (modifiedParams.sortBy) {
      modifiedParams.sort_by = modifiedParams.sortBy;
      delete modifiedParams.sortBy;
    }

    // Map rating filter
    if (modifiedParams.minRating && modifiedParams.minRating > 0) {
      modifiedParams["vote_average.gte"] = modifiedParams.minRating;
      delete modifiedParams.minRating;
    } else {
      delete modifiedParams.minRating;
    }

    if (isKidsProfile) {
      modifiedParams.with_genres = KIDS_SAFE_GENRES.join(",");
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

  async getGenres(type = "movie") {
    return type === "movie" ? tmdb.getMovieGenres() : tmdb.getTVGenres();
  },
};

function filterKidsContent(items) {
  return items.filter((item) => {
    // Filter by genre
    if (item.genre_ids) {
      const hasKidsSafeGenre = item.genre_ids.some((id) =>
        KIDS_SAFE_GENRES.includes(id.toString()),
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
