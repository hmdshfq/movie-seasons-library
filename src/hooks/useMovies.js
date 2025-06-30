import { useState } from "react";
import { tmdbService } from "../services/tmdb.service";

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const discoverMovies = async (filters) => {
    setLoading(true);
    try {
      const results = await tmdbService.discoverMovies(filters);
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
      const results = await tmdbService.searchMovies({ query, mediaType });
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
      const movie = await tmdbService.getRandomMovie(mediaType);
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
