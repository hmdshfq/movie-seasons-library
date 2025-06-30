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
    // Check active sessions and sets the user
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfiles(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfiles(session.user.id);
        } else {
          setProfiles([]);
          setProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfiles = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      setProfiles(data);
      // Check for saved profile preference
      const savedProfileId = localStorage.getItem("activeProfileId");
      const savedProfile = data.find((p) => p.id === savedProfileId);

      if (savedProfile) {
        setProfile(savedProfile);
      } else if (!profile) {
        setProfile(data[0]);
      }
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
    navigate("/login");
  };

  const createProfile = async (
    userId,
    name,
    isKids = false,
    avatarUrl = null
  ) => {
    const profileData = {
      user_id: userId || user.id,
      name,
      is_kids: isKids,
      avatar_url:
        avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          name
        )}&background=random`,
    };

    const { data, error } = await supabase
      .from("profiles")
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;

    setProfiles([...profiles, data]);
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
    fetchProfiles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
