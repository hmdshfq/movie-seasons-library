import { useState } from "react";
import { tmdbService } from "../services/tmdb.service";
import { useAuth } from "./useAuth";

interface Movie {
  id: number;
  [key: string]: unknown;
}

interface DiscoverFilters {
  mediaType?: string;
  genre?: string;
  year?: string;
  sortBy?: string;
  minRating?: number;
  page?: number;
  [key: string]: unknown;
}

export function useMovies() {
  const { profile, preferences } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const MOVIES_PER_PAGE = 18;
  const discoverMovies = async (filters: DiscoverFilters, page = 1): Promise<{ results: Movie[]; total: number }> => {
    setLoading(true);
    try {
      const isKidsProfile = profile?.is_kids || false;
      const hideHorror = preferences?.hide_horror || false;
      const { results, total } = await tmdbService.discoverMovies(
        { ...filters, page },
        isKidsProfile,
        hideHorror,
      );
      setMovies(results);
      return { results, total };
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query: string, mediaType?: string, page = 1): Promise<{ results: Movie[]; total: number }> => {
    if (!query.trim()) return { results: [], total: 0 };

    setLoading(true);
    try {
      const isKidsProfile = profile?.is_kids || false;
      const results = await tmdbService.searchMovies(
        { query, mediaType, page },
        isKidsProfile,
      );
      setMovies(results.results || (results as Movie[]));
      return results.total ? results : { results: results.results || (results as Movie[]), total: 0 };
    } catch (error) {
      console.error("Error searching movies:", error);
      setMovies([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRandomMovie = async (mediaType: "movie" | "tv" = "movie"): Promise<Movie[]> => {
    setLoading(true);
    try {
      const isKidsProfile = profile?.is_kids || false;
      const hideHorror = preferences?.hide_horror || false;
      const movies = await tmdbService.getRandomMovie(mediaType, isKidsProfile, hideHorror);
      if (movies && movies.length > 0) {
        setMovies(movies);
        return movies;
      }
      return [];
    } catch (error) {
      console.error("Error getting random movie:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    movies,
    loading,
    discoverMovies,
    searchMovies,
    getRandomMovie,
  };
}
