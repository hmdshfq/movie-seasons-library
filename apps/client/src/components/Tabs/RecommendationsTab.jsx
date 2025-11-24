import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Sparkles, RefreshCw } from "lucide-react";
import { movieService } from "../../services/movie.service";
import { watchlistService } from "../../services/watchlist.service";
import { tmdbService } from "../../services/tmdb.service";
import MovieCarousel from "../MovieCarousel/MovieCarousel";
import LoadingSpinner from "../UI/LoadingSpinner";
import Button from "../UI/Button";

export default function RecommendationsTab({ showMovieDetails, announce }) {
  const { profile, user } = useAuth();
  const [carouselData, setCarouselData] = useState({
    highlyRated: [],
    recentWatches: [],
    trendingGenres: [],
    topRatedGenres: [],
  });
  const [loadingCarousels, setLoadingCarousels] = useState({
    highlyRated: false,
    recentWatches: false,
    trendingGenres: false,
    topRatedGenres: false,
  });
  const [hasWatchedMovies, setHasWatchedMovies] = useState(false);

  useEffect(() => {
    checkWatchedMovies();
  }, [profile]);

  const checkWatchedMovies = async () => {
    if (!profile) return;

    try {
      const watched = await movieService.getWatchedMovies();
      setHasWatchedMovies(watched.length > 0);

      if (watched.length > 0) {
        getRecommendations();
      }
    } catch (error) {
      console.error("Error checking watched movies:", error);
    }
  };

  const filterMovies = async (movies) => {
    if (!movies || movies.length === 0) return [];

    try {
      // Get watched and watchlist movie IDs
      const watched = await movieService.getWatchedMovies();
      const watchlist = await watchlistService.getWatchlist();
      const watchedIds = new Set(watched.map((m) => m.movie_id));
      const watchlistIds = new Set(watchlist.map((m) => m.movie_id));

      // Filter out watched and watchlist items
      let filtered = movies.filter(
        (movie) => !watchedIds.has(movie.id) && !watchlistIds.has(movie.id),
      );

      // Apply horror filter if enabled
      if (profile?.hide_horror) {
        filtered = filtered.filter(
          (movie) => !movie.genre_ids || !movie.genre_ids.includes(27),
        );
      }

      // Apply kids profile filter
      if (profile?.is_kids_profile) {
        filtered = filtered.filter((movie) => {
          if (!movie.genre_ids) return true;
          const kidsGenres = ["16", "10751", "12", "35"];
          return movie.genre_ids.some((id) =>
            kidsGenres.includes(id.toString()),
          );
        });
      }

      return filtered;
    } catch (error) {
      console.error("Error filtering movies:", error);
      return movies;
    }
  };

  const getRecommendations = async () => {
    if (!profile) return;

    announce("Getting personalized recommendations...");

    try {
      const watched = await movieService.getWatchedMovies();

      // Carousel 1: Based on Highly Rated (4-5 stars)
      const highlyRatedWatched = watched.filter((m) => m.rating >= 4);
      await buildHighlyRatedCarousel(highlyRatedWatched);

      // Carousel 2: More Like Recent Watches
      const recentWatched = watched.slice(-10);
      await buildRecentWatchesCarousel(recentWatched);

      // Carousel 3 & 4: Genre-based (requires preferences)
      await buildGenreBasedCarousels();

      announce("Personalized recommendations loaded");
    } catch (error) {
      console.error("Error getting recommendations:", error);
      announce("Error getting recommendations. Please try again.");
    }
  };

  const buildHighlyRatedCarousel = async (highlyRatedMovies) => {
    setLoadingCarousels((prev) => ({ ...prev, highlyRated: true }));
    try {
      const movies = new Set();

      for (const watched of highlyRatedMovies.slice(0, 5)) {
        const similar = await tmdbService.getSimilarMovies(
          watched.movie_id,
          profile?.is_kids_profile,
          profile?.hide_horror,
        );
        similar.slice(0, 10).forEach((m) => movies.add(JSON.stringify(m)));
      }

      const filtered = await filterMovies(
        Array.from(movies)
          .map((m) => JSON.parse(m))
          .slice(0, 20),
      );

      setCarouselData((prev) => ({ ...prev, highlyRated: filtered }));
    } catch (error) {
      console.error("Error building highly rated carousel:", error);
    } finally {
      setLoadingCarousels((prev) => ({ ...prev, highlyRated: false }));
    }
  };

  const buildRecentWatchesCarousel = async (recentMovies) => {
    setLoadingCarousels((prev) => ({ ...prev, recentWatches: true }));
    try {
      const movies = new Set();

      for (const watched of recentMovies) {
        const recs = await tmdbService.getRecommendations(
          watched.movie_id,
          profile?.is_kids_profile,
        );
        recs.slice(0, 10).forEach((m) => movies.add(JSON.stringify(m)));
      }

      const filtered = await filterMovies(
        Array.from(movies)
          .map((m) => JSON.parse(m))
          .slice(0, 20),
      );

      setCarouselData((prev) => ({ ...prev, recentWatches: filtered }));
    } catch (error) {
      console.error("Error building recent watches carousel:", error);
    } finally {
      setLoadingCarousels((prev) => ({ ...prev, recentWatches: false }));
    }
  };

  const buildGenreBasedCarousels = async () => {
    setLoadingCarousels((prev) => ({
      ...prev,
      trendingGenres: true,
      topRatedGenres: true,
    }));
    try {
      const favoriteGenres = profile?.favorite_genres || [];

      if (favoriteGenres.length > 0) {
        // Get trending in favorite genres
        const trending = await tmdbService.getTrendingMovies(
          "week",
          profile?.is_kids_profile,
          profile?.hide_horror,
        );
        const trendingFiltered = trending
          .filter((m) => {
            if (!m.genre_ids) return false;
            return m.genre_ids.some((id) => favoriteGenres.includes(id));
          })
          .slice(0, 20);
        const trendingFinal = await filterMovies(trendingFiltered);
        setCarouselData((prev) => ({ ...prev, trendingGenres: trendingFinal }));

        // Get top rated in favorite genres
        const topRated = await tmdbService.discoverByGenreAndRating(
          favoriteGenres,
          7.5,
          profile?.is_kids_profile,
          profile?.hide_horror,
        );
        const topRatedFinal = await filterMovies(topRated.slice(0, 20));
        setCarouselData((prev) => ({
          ...prev,
          topRatedGenres: topRatedFinal,
        }));
      }
    } catch (error) {
      console.error("Error building genre-based carousels:", error);
    } finally {
      setLoadingCarousels((prev) => ({
        ...prev,
        trendingGenres: false,
        topRatedGenres: false,
      }));
    }
  };

  if (!hasWatchedMovies) {
    return (
      <section
        className="animate-fadeIn"
        aria-label="Personalized recommendations"
      >
        <div className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-2xl text-center">
          <Sparkles size={64} className="mx-auto text-indigo-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            Personalized Recommendations
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Add some movies to your library first to get personalized
            recommendations tailored just for you!
          </p>
        </div>
      </section>
    );
  }

  const isAnyLoading = Object.values(loadingCarousels).some((l) => l);

  return (
    <section
      className="animate-fadeIn"
      aria-label="Personalized recommendations"
    >
      <div className="bg-slate-800 rounded-2xl p-6 mb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Recommended For You</h2>
          <Button
            onClick={getRecommendations}
            variant="secondary"
            icon={RefreshCw}
            disabled={isAnyLoading}
            aria-label="Refresh recommendations"
          >
            Refresh
          </Button>
        </div>
        <p className="text-gray-400">
          Personalized recommendations based on your watched history and
          preferences
        </p>
      </div>

      {isAnyLoading && Object.values(carouselData).every((c) => c.length === 0) ? (
        <LoadingSpinner message="Analyzing your preferences..." />
      ) : (
        <div className="space-y-8">
          <MovieCarousel
            title="Based on Your Highly Rated"
            movies={carouselData.highlyRated}
            onMovieClick={showMovieDetails}
            isLoading={loadingCarousels.highlyRated}
          />

          <MovieCarousel
            title="More Like Your Recent Watches"
            movies={carouselData.recentWatches}
            onMovieClick={showMovieDetails}
            isLoading={loadingCarousels.recentWatches}
          />

          {profile?.favorite_genres && profile.favorite_genres.length > 0 && (
            <>
              <MovieCarousel
                title="Trending in Your Favorite Genres"
                movies={carouselData.trendingGenres}
                onMovieClick={showMovieDetails}
                isLoading={loadingCarousels.trendingGenres}
              />

              <MovieCarousel
                title="Top Rated in Your Favorite Genres"
                movies={carouselData.topRatedGenres}
                onMovieClick={showMovieDetails}
                isLoading={loadingCarousels.topRatedGenres}
              />
            </>
          )}
        </div>
      )}
    </section>
  );
}
