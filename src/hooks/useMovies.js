import { useState } from "react";
import { tmdbService } from "../services/tmdb.service";
import { useAuth } from "../contexts/AuthContext";

export function useMovies() {
  const { profile } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const discoverMovies = async (filters) => {
    setLoading(true);
    try {
      const isKidsProfile = profile?.is_kids || false;
      const results = await tmdbService.discoverMovies(filters, isKidsProfile);
      setMovies(results);
      return results;
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query, mediaType) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const isKidsProfile = profile?.is_kids || false;
      const results = await tmdbService.searchMovies(
        { query, mediaType },
        isKidsProfile,
      );
      setMovies(results);
      return results;
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
      const movie = await tmdbService.getRandomMovie(mediaType, isKidsProfile);
      if (movie) {
        setMovies([movie]);
        return movie;
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
