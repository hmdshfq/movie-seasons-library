import { supabase } from '../lib/supabase';

export const profileService = {
  async getProfiles(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getProfile(profileId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) throw error;
    return data;
  },

  async createProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        user_id: user.id,
        name: profileData.name,
        is_kids: profileData.isKids || false,
        avatar_url: profileData.avatar_url
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(profileId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        is_kids: updates.isKids,
        avatar_url: updates.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProfile(profileId) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
  },

  async getPreferences(profileId) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || {
      language: 'en',
      autoplay: true,
      notifications: true,
      showMatureContent: true
    };
  },

  async updatePreferences(profileId, preferences) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{
        profile_id: profileId,
        ...preferences,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};