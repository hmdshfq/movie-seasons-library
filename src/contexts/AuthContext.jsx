import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth session error:", error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user || null);

          // If user exists, fetch profiles
          if (session?.user) {
            await fetchProfiles(session.user.id);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setProfiles([]);
        return;
      }

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user || null);

        if (session?.user) {
          fetchProfiles(session.user.id).catch(console.error);
        } else {
          setProfiles([]);
          setProfile(null);
        }
      }
    });

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfiles = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Profile fetch error:", error.message);
        setProfiles([]);
        setProfile(null);
        return;
      }

      if (data && data.length > 0) {
        setProfiles(data);

        // Check for saved profile preference
        const savedProfileId = localStorage.getItem("activeProfileId");
        const savedProfile = data.find((p) => p.id === savedProfileId);

        if (savedProfile) {
          setProfile(savedProfile);
        } else {
          setProfile(data[0]);
        }
      } else {
        setProfiles([]);
        setProfile(null);
      }
    } catch (error) {
      console.warn("fetchProfiles error:", error.message);
      setProfiles([]);
      setProfile(null);
    }
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create default profile for new user
    if (data.user) {
      await createProfile(data.user.id, "Main Profile");
    }

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear local state
    setUser(null);
    setProfile(null);
    setProfiles([]);
    localStorage.removeItem("activeProfileId");

    navigate("/login");
  };

  const createProfile = async (
    userId,
    name,
    isKids = false,
    avatarUrl = null,
  ) => {
    const profileData = {
      user_id: userId || user.id,
      name,
      is_kids: isKids,
      avatar_url:
        avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name,
        )}&background=random`,
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;

    setProfiles((prev) => [...prev, data]);
    return data;
  };

  const switchProfile = (profileId) => {
    const selectedProfile = profiles.find((p) => p.id === profileId);
    if (selectedProfile) {
      setProfile(selectedProfile);
      localStorage.setItem("activeProfileId", profileId);
    }
  };

  const value = {
    user,
    profile,
    profiles,
    loading,
    signUp,
    signIn,
    signOut,
    createProfile,
    switchProfile,
    fetchProfiles: (userId) => fetchProfiles(userId),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
