import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message, onClose }) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
      <AlertCircle size={20} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-300 transition-colors"
          aria-label="Dismiss error">
          ×
        </button>
      )}
    </div>
  );
}
