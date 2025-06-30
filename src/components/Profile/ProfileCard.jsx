import { Edit2, Trash2, Shield } from "lucide-react";

export default function ProfileCard({
  profile,
  onEdit,
  onDelete,
  isActive = false,
}) {
  return (
    <div
      className={`relative group ${isActive ? "ring-2 ring-indigo-500" : ""}`}>
      <div className="bg-slate-700 rounded-lg p-4 transition-all group-hover:bg-slate-600">
        <div className="relative mb-4">
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-24 h-24 mx-auto rounded-lg object-cover"
          />
          {profile.is_kids && (
            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
              <Shield size={16} />
            </div>
          )}
        </div>

        <h3 className="text-center font-medium mb-3">{profile.name}</h3>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(profile)}
            className="flex-1 p-2 bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
            aria-label={`Edit ${profile.name}`}>
            <Edit2 size={16} className="mx-auto" />
          </button>
          <button
            onClick={() => onDelete(profile)}
            className="flex-1 p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            aria-label={`Delete ${profile.name}`}>
            <Trash2 size={16} className="mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
