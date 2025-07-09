import { Film, Tv } from "lucide-react";

export default function MediaTypeToggle({ value, onChange, className = "" }) {
  const handleToggle = () => {
    const newValue = value === "movie" ? "tv" : "movie";
    onChange(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Type
      </label>

      {/* Toggle Container */}
      <div className="relative bg-slate-700 rounded-full p-1 w-full max-w-xs mx-auto">
        {/* Background Slider */}
        <div
          className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300 ease-out transform ${
            value === "movie" ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
          }}
        />

        {/* Options Container */}
        <div className="relative z-10 flex">
          {/* Movie Option */}
          <button
            onClick={() => onChange("movie")}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-full transition-all duration-300 ${
              value === "movie"
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
            aria-pressed={value === "movie"}
          >
            <Film
              size={16}
              className={`mr-2 transition-all duration-300 ${
                value === "movie" ? "scale-110" : "scale-100"
              }`}
            />
            <span className="font-medium text-sm">Movies</span>
          </button>

          {/* TV Shows Option */}
          <button
            onClick={() => onChange("tv")}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-full transition-all duration-300 ${
              value === "tv"
                ? "text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
            aria-pressed={value === "tv"}
          >
            <Tv
              size={16}
              className={`mr-2 transition-all duration-300 ${
                value === "tv" ? "scale-110" : "scale-100"
              }`}
            />
            <span className="font-medium text-sm">TV Shows</span>
          </button>
        </div>
      </div>

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite">
        Currently selected: {value === "movie" ? "Movies" : "TV Shows"}
      </div>
    </div>
  );
}
