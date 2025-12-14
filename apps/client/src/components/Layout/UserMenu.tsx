import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { User, LogOut, Users, Settings, ChevronDown } from "lucide-react";

export default function UserMenu() {
  const { profile, profiles, switchProfile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!profile) {
    return (
      <div className="flex items-center gap-2 p-2">
        <User size={20} className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700 transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}>
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className="w-8 h-8 rounded"
        />
        <span className="text-sm font-medium hidden sm:block">
          {profile.name}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-2">
          {/* Profile Switcher */}
          <div className="px-4 py-2 border-b border-slate-700">
            <p className="text-xs text-gray-400 mb-2">Switch Profile</p>
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  switchProfile(p.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition-colors ${
                  p.id === profile.id ? "bg-slate-700" : ""
                }`}>
                <img
                  src={p.avatar_url}
                  alt={p.name}
                  className="w-6 h-6 rounded"
                />
                <span className="text-sm">{p.name}</span>
                {p.is_kids && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded ml-auto">
                    Kids
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                navigate("/manage-profiles");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 transition-colors">
              <Users size={18} />
              <span className="text-sm">Manage Profiles</span>
            </button>

            <button
              onClick={() => {
                navigate("/settings");
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 transition-colors">
              <Settings size={18} />
              <span className="text-sm">Settings</span>
            </button>

            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-700 transition-colors text-red-400">
              <LogOut size={18} />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
