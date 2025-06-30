import { useState } from "react";
import { X, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../UI/Input";
import Button from "../UI/Button";
import ErrorMessage from "../UI/ErrorMessage";
import { DEFAULT_AVATAR_COLORS } from "../../utils/constants";

export default function CreateProfileModal({ onClose, onSuccess }) {
  const { createProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    isKids: false,
    avatarColor: DEFAULT_AVATAR_COLORS[0],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Profile name is required");
      return;
    }

    if (formData.name.length > 20) {
      setError("Profile name must be 20 characters or less");
      return;
    }

    setLoading(true);
    try {
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        formData.name
      )}&background=${formData.avatarColor.slice(1)}&color=fff&size=200`;
      await createProfile(null, formData.name, formData.isKids, avatarUrl);
      onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div
        className="bg-slate-800 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <ErrorMessage message={error} />}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Choose Avatar Color
            </label>
            <div className="flex gap-3 justify-center mb-6">
              {DEFAULT_AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, avatarColor: color }))
                  }
                  className={`w-12 h-12 rounded-lg transition-all ${
                    formData.avatarColor === color
                      ? "ring-4 ring-white scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} color`}
                />
              ))}
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    formData.name || "Profile"
                  )}&background=${formData.avatarColor.slice(
                    1
                  )}&color=fff&size=100`}
                  alt="Profile avatar preview"
                  className="w-24 h-24 rounded-lg"
                />
              </div>
            </div>
          </div>

          <Input
            label="Profile Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            icon={User}
            placeholder="Enter profile name"
            maxLength={20}
            required
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isKids"
              checked={formData.isKids}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isKids: e.target.checked }))
              }
              className="w-5 h-5 rounded border-gray-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isKids" className="flex-1">
              <span className="font-medium">Kids Profile</span>
              <p className="text-sm text-gray-400">
                Only show content suitable for children
              </p>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              fullWidth>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}>
              Create Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
