import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "../MovieGrid/MovieCard";
import { useRef } from "react";

export default function MovieCarousel({ title, movies, onMovieClick, isLoading = false }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 400;
    const newScrollPosition =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>
        <div className="flex gap-6 pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40">
              <div className="aspect-[2/3] bg-slate-700 rounded-lg animate-pulse" />
              <div className="mt-4 h-4 bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll left">
          <ChevronLeft size={24} />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-40">
              <MovieCard movie={movie} onClick={onMovieClick} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/75 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Scroll right">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
