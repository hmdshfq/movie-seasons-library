import { useState } from "react";
import { User } from "lucide-react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import ErrorMessage from "../UI/ErrorMessage";
import { DEFAULT_AVATAR_COLORS } from "../../utils/constants";

export default function ProfileForm({ profile, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    isKids: profile?.is_kids || false,
    avatarColor: profile
      ? extractColorFromUrl(profile.avatar_url)
      : DEFAULT_AVATAR_COLORS[0],
  });
  const [error, setError] = useState("");

  function extractColorFromUrl(url) {
    const match = url.match(/background=([a-fA-F0-9]{6})/);
    return match ? `#${match[1]}` : DEFAULT_AVATAR_COLORS[0];
  }

  const handleSubmit = (e) => {
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

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.name
    )}&background=${formData.avatarColor.slice(1)}&color=fff&size=200`;

    onSubmit({
      ...formData,
      avatar_url: avatarUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage message={error} />}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Avatar Color
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
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              formData.name || "Profile"
            )}&background=${formData.avatarColor.slice(1)}&color=fff&size=100`}
            alt="Profile avatar preview"
            className="w-24 h-24 rounded-lg"
          />
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
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}>
          {profile ? "Update" : "Create"} Profile
        </Button>
      </div>
    </form>
  );
}
