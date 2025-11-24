import { useState } from "react";
import { tmdbService } from "../services/tmdb.service";
import { useAuth } from "../contexts/AuthContext";

export function useMovies() {
  const { profile } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const MOVIES_PER_PAGE = 18;
  const discoverMovies = async (filters, page = 1) => {
    setLoading(true);
    try {
      const isKidsProfile = profile?.is_kids || false;
      const { results, total } = await tmdbService.discoverMovies(
        { ...filters, page },
        isKidsProfile,
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

  const searchMovies = async (query, mediaType, page = 1) => {
    if (!query.trim()) return { results: [], total: 0 };

    setLoading(true);
    try {
      const isKidsProfile = profile?.is_kids || false;
      const results = await tmdbService.searchMovies(
        { query, mediaType, page },
        isKidsProfile,
      );
      setMovies(results.results || results);
      return results.total ? results : { results, total: 0 };
    } catch (error) {
      console.error("Error searching movies:", error);
      setMovies([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRandomMovie = async (mediaType) => {
    setLoading(true);
    try {
      const isKidsProfile = profile?.is_kids || false;
      const movies = await tmdbService.getRandomMovie(mediaType, isKidsProfile);
      if (movies && movies.length > 0) {
        setMovies(movies);
        return movies;
      }
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
