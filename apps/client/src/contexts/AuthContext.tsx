import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service";
import { profileService } from "../services/profile.service";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const session = await authService.getSession();

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            // Fetch profile for authenticated user
            await fetchProfile();
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for storage changes (auth token updates)
    const handleStorageChange = (e) => {
      if (e.key === "authToken") {
        if (e.newValue) {
          initializeAuth();
        } else if (mounted) {
          setUser(null);
          setProfile(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await profileService.getProfile();
      if (profileData) {
        setProfile(profileData);
        localStorage.setItem("activeProfileId", profileData.id);
        // Fetch preferences after profile is loaded
        await fetchPreferences();
      }
    } catch (error) {
      console.warn("Profile fetch error:", error.message);
      setProfile(null);
    }
  };

  const fetchPreferences = async () => {
    try {
      const prefsData = await profileService.getPreferences();
      if (prefsData) {
        setPreferences(prefsData);
      }
    } catch (error) {
      console.warn("Preferences fetch error:", error.message);
      setPreferences(null);
    }
  };

  const signUp = async (email, password, name = "") => {
    const result = await authService.signUp(email, password, name);
    if (result.user) {
      setUser(result.user);
      // Fetch profile after signup
      await fetchProfile();
    }
    return result;
  };

  const signIn = async (email, password) => {
    const result = await authService.signIn(email, password);
    if (result.user) {
      setUser(result.user);
      // Fetch profile after login
      await fetchProfile();
    }
    return result;
  };

  const signOut = async () => {
    await authService.signOut();

    // Clear local state
    setUser(null);
    setProfile(null);
    localStorage.removeItem("activeProfileId");

    navigate("/login");
  };

  const updateProfile = async (updates) => {
    const updated = await profileService.updateProfile(updates);
    if (updated) {
      setProfile(updated);
    }
    return updated;
  };

  const updatePreferences = async (prefs) => {
    const updated = await profileService.updatePreferences(prefs);
    if (updated) {
      setPreferences(updated);
    }
    return updated;
  };

  // Fetch profiles (returns array for compatibility, typically just one)
  const fetchProfiles = async () => {
    try {
      const profileData = await profileService.getProfile();
      if (profileData) {
        setProfile(profileData);
        // Fetch preferences after profile is loaded
        await fetchPreferences();
      }
    } catch (error) {
      console.warn("Failed to fetch profiles:", error);
    }
  };

  const value = {
    user,
    profile,
    preferences,
    profiles: profile ? [profile] : [],
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePreferences,
    fetchProfile,
    fetchProfiles,
    switchProfile: () => {}, // No-op for single profile mode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
