import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";
import "./RatingSlider.css";

export default function RatingSlider({ value = 5, onChange, className = "" }) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
  };

  const handleLegendClick = (rating) => {
    setLocalValue(rating);
  };

  const getStarColor = (starRating) => {
    if (localValue >= starRating) {
      return "text-amber-400 fill-current";
    }
    return "text-gray-600";
  };

  const getRatingLabel = (rating) => {
    if (rating === 0) return "Any";
    if (rating <= 2) return "Poor";
    if (rating <= 4) return "Below Average";
    if (rating <= 6) return "Average";
    if (rating <= 8) return "Good";
    return "Excellent";
  };

  const legendItems = [0, 2, 4, 6, 8, 10];

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Rating Display */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-400">
          Min Rating
        </label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[2, 4, 6, 8, 10].map((starRating) => (
              <Star
                key={starRating}
                size={16}
                className={`transition-colors duration-200 ${getStarColor(starRating)}`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-white min-w-12">
            {localValue === 0 ? 5 : `${localValue}/10`}
          </span>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Custom Slider Track */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={localValue}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer rating-slider-thumb"
            style={{
              background: `linear-gradient(to right,
                #f59e0b 0%,
                #f59e0b ${(localValue / 10) * 100}%,
                #475569 ${(localValue / 10) * 100}%,
                #475569 100%)`,
            }}
          />
        </div>

        {/* Legend Scale */}
        <div className="flex justify-between mt-2 px-1">
          {legendItems.map((rating) => (
            <button
              key={rating}
              onClick={() => handleLegendClick(rating)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 hover:bg-slate-700 group ${
                Math.abs(localValue - rating) < 0.5 ? "bg-slate-700" : ""
              }`}
              aria-label={`Set minimum rating to ${rating === 0 ? "any" : rating}`}
            >
              <span
                className={`text-xs font-medium transition-colors ${
                  Math.abs(localValue - rating) < 0.5
                    ? "text-amber-400"
                    : "text-gray-400 group-hover:text-gray-300"
                }`}
              >
                {rating === 0 ? "Any" : rating}
              </span>
              <div className="h-2 w-0.5 bg-gray-500 group-hover:bg-gray-400 transition-colors"></div>
            </button>
          ))}
        </div>

        {/* Rating Label */}
        <div className="text-center mt-2">
          <span className="text-xs text-gray-400 font-medium">
            {getRatingLabel(localValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
