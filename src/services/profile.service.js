import { api } from '../lib/api';

export const profileService = {
  async getProfile() {
    return api.get('/api/profile');
  },

  async updateProfile(updates) {
    return api.put('/api/profile', {
      name: updates.name,
      is_kids: updates.isKids,
      avatar_url: updates.avatar_url
    });
  },

  async getPreferences() {
    return api.get('/api/profile/preferences');
  },

  async updatePreferences(preferences) {
    return api.put('/api/profile/preferences', preferences);
  }
};