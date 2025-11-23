import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, User } from "lucide-react";
import { useState, useEffect } from "react";
import CreateProfileModal from "../Modal/CreateProfileModal";

export default function ProfileSelector() {
  const { profiles, profile } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // If only one profile, skip to home
  useEffect(() => {
    if (profiles.length === 1) {
      navigate("/");
    }
  }, [profiles, navigate]);

  const handleProfileSelect = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Who's watching?
          </h1>
          <p className="text-gray-400">Select your profile to continue</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {profiles.map((prof) => (
            <button
              key={prof.id}
              onClick={() => handleProfileSelect()}
              className="group text-center transition-all transform hover:scale-105"
              aria-label={`Select ${prof.name} profile`}>
              <div className="relative mb-4">
                <img
                  src={prof.avatar_url}
                  alt={prof.name}
                  className="w-32 h-32 mx-auto rounded-lg object-cover group-hover:ring-4 group-hover:ring-indigo-500 transition-all"
                />
                {prof.is_kids && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Kids
                  </span>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-200 group-hover:text-white transition-colors">
                {prof.name}
              </h3>
            </button>
          ))}

          {profiles.length < 5 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="group text-center transition-all transform hover:scale-105"
              aria-label="Add new profile">
              <div className="w-32 h-32 mx-auto mb-4 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                <Plus
                  size={48}
                  className="text-gray-400 group-hover:text-white transition-colors"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-400 group-hover:text-white transition-colors">
                Add Profile
              </h3>
            </button>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/manage-profiles")}
            className="text-gray-400 hover:text-white transition-colors">
            Manage Profiles
          </button>
        </div>

        {showCreateModal && (
          <CreateProfileModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => setShowCreateModal(false)}
          />
        )}
      </div>
    </div>
  );
}
