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
      const results = await tmdbService.discoverMovies(filters, isKidsProfile);
      const start = (page - 1) * MOVIES_PER_PAGE;
      const end = start + MOVIES_PER_PAGE;
      const paged = Array.isArray(results) ? results.slice(start, end) : [];
      setMovies(paged);
      return { results: paged, total: Array.isArray(results) ? results.length : 0 };
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
        { query, mediaType },
        isKidsProfile,
      );
      const start = (page - 1) * MOVIES_PER_PAGE;
      const end = start + MOVIES_PER_PAGE;
      const paged = Array.isArray(results) ? results.slice(start, end) : [];
      setMovies(paged);
      return { results: paged, total: Array.isArray(results) ? results.length : 0 };
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
