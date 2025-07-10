import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Sparkles, RefreshCw } from "lucide-react";
import { movieService } from "../../services/movie.service";
import { tmdbService } from "../../services/tmdb.service";
import MovieGrid from "../MovieGrid/MovieGrid";
import LoadingSpinner from "../UI/LoadingSpinner";
import Button from "../UI/Button";

export default function RecommendationsTab({ showMovieDetails, announce }) {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasWatchedMovies, setHasWatchedMovies] = useState(false);

  useEffect(() => {
    checkWatchedMovies();
  }, [profile]);

  const checkWatchedMovies = async () => {
    if (!profile) return;

    try {
      const watched = await movieService.getWatchedMovies(profile.id);
      setHasWatchedMovies(watched.length > 0);

      if (watched.length > 0) {
        getRecommendations();
      }
    } catch (error) {
      console.error("Error checking watched movies:", error);
    }
  };

  const getRecommendations = async () => {
    if (!profile) return;

    setLoading(true);
    announce("Getting personalized recommendations...");

    try {
      const watched = await movieService.getWatchedMovies(profile.id);
      const watchedIds = new Set(watched.map((m) => m.movie_id));
      const recommendationSet = new Set();
      const targetCount = 6;

      // Start with more recent movies and get more recommendations per movie
      let movieIndex = 0;
      let recsPerMovie = 6;

      while (
        recommendationSet.size < targetCount &&
        movieIndex < watched.length
      ) {
        const moviesToProcess = watched.slice(
          -Math.min(8 + movieIndex, watched.length),
          watched.length - movieIndex,
        );

        for (const movie of moviesToProcess) {
          if (recommendationSet.size >= targetCount) break;

          const recs = await tmdbService.getRecommendations(movie.movie_id);
          recs
            .filter((rec) => !watchedIds.has(rec.id))
            .slice(0, recsPerMovie)
            .forEach((rec) => {
              recommendationSet.add(JSON.stringify(rec));
            });
        }

        movieIndex += moviesToProcess.length;
        recsPerMovie = Math.min(recsPerMovie + 2, 10);
      }

      // Shuffle recommendations before picking 6
      const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      const allRecommendations = Array.from(recommendationSet).map((r) => JSON.parse(r));
      const shuffled = shuffle(allRecommendations);
      const uniqueRecommendations = shuffled.slice(0, targetCount); // Random 6

      setRecommendations(uniqueRecommendations);
      announce(
        `Found ${uniqueRecommendations.length} recommendations based on your library`,
      );
    } catch (error) {
      console.error("Error getting recommendations:", error);
      announce("Error getting recommendations. Please try again.");
    } finally {
      setLoading(false);
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
            disabled={loading}
            aria-label="Refresh recommendations"
          >
            Refresh
          </Button>
        </div>
        <p className="text-gray-400">
          Based on your watched history, we think you'll love these:
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Analyzing your preferences..." />
      ) : (
        <MovieGrid movies={recommendations} onMovieClick={showMovieDetails} />
      )}
    </section>
  );
}
