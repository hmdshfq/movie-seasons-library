import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { profileService } from '../services/profile.service';

export function useProfile() {
  const { profile, profiles, switchProfile } = useAuth();
  const [preferences, setPreferences] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchPreferences();
    }
  }, [profile]);

  const fetchPreferences = async (): Promise<void> => {
    setLoading(true);
    try {
      const prefs = await profileService.getPreferences() as Record<string, unknown>;
      setPreferences(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Record<string, unknown>): Promise<Record<string, unknown>> => {
    setLoading(true);
    try {
      const updated = await profileService.updatePreferences(newPreferences) as Record<string, unknown>;
      setPreferences(updated);
      return updated;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    profiles,
    preferences,
    loading,
    switchProfile,
    updatePreferences,
  };
}
