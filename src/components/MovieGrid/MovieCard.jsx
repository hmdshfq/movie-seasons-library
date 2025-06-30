import { Star } from "lucide-react";
import { IMG_BASE_URL } from "../../utils/constants";

export default function MovieCard({ movie, onClick }) {
  return (
    <article
      onClick={() => onClick(movie)}
      onKeyPress={(e) => e.key === "Enter" && onClick(movie)}
      className="bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover-lift shadow-lg"
      tabIndex={0}
      role="listitem"
      aria-label={`${
        movie.title || movie.name
      }, rated ${movie.vote_average?.toFixed(1)} out of 10`}>
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={
            movie.poster_path
              ? IMG_BASE_URL + movie.poster_path
              : "https://via.placeholder.com/500x750?text=No+Poster"
          }
          alt={`${movie.title || movie.name} poster`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
          {movie.title || movie.name}
        </h3>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Star size={12} fill="currentColor" aria-hidden="true" />
            <span>{movie.vote_average?.toFixed(1)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
