import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import ProfileCard from "./ProfileCard";
import ProfileForm from "./ProfileForm";
import Button from "../UI/Button";
import { MAX_PROFILES_PER_USER } from "../../utils/constants";
import { profileService } from "../../services/profile.service";

export default function ManageProfiles() {
  const { profiles, fetchProfiles } = useAuth();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (profileData) => {
    setLoading(true);
    try {
      await profileService.updateProfile(profileData);
      await fetchProfiles();
      setCreating(false);
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (profileData) => {
    setLoading(true);
    try {
      await profileService.updateProfile(profileData);
      await fetchProfiles();
      setEditingProfile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profile) => {
    console.warn("Profile deletion not supported in this version");
  };

  if (creating || editingProfile) {
    return (
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">
          {creating ? "Create New Profile" : "Edit Profile"}
        </h2>
        <ProfileForm
          profile={editingProfile}
          onSubmit={creating ? handleCreate : handleUpdate}
          onCancel={() => {
            setCreating(false);
            setEditingProfile(null);
          }}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Manage Profiles</h2>
        <Button
          onClick={() => navigate("/profiles")}
          variant="secondary"
          icon={ArrowLeft}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onEdit={setEditingProfile}
            onDelete={handleDelete}
          />
        ))}

        {profiles.length < MAX_PROFILES_PER_USER && (
          <button
            onClick={() => setCreating(true)}
            className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors group">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-600 rounded-lg flex items-center justify-center group-hover:bg-slate-500 transition-colors">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-center font-medium">Add Profile</h3>
          </button>
        )}
      </div>

      {profiles.length >= MAX_PROFILES_PER_USER && (
        <p className="text-center text-gray-400">
          You've reached the maximum of {MAX_PROFILES_PER_USER} profiles
        </p>
      )}
    </div>
  );
}
