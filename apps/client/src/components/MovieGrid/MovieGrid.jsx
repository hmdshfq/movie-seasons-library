import MovieCard from "./MovieCard";

export default function MovieGrid({ movies, onMovieClick }) {
  if (!movies || movies.length === 0) {
    return (
      <p className="text-center text-gray-400 py-12">
        No results found. Try different filters!
      </p>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      role="list"
      aria-label="Movie results">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onClick={onMovieClick} />
      ))}
    </div>
  );
}
