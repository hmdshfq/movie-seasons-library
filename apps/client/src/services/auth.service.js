import { api } from '../lib/api';

export const authService = {
  async signUp(email, password, name = '') {
    const response = await api.post('/api/auth/register', { email, password, name });
    // Store tokens in localStorage for backward compatibility, but rely on HttpOnly cookies for primary auth
    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken);
    }
    return { user: response.user, session: { access_token: response.accessToken } };
  },

  async signIn(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    // Store tokens in localStorage for backward compatibility, but rely on HttpOnly cookies for primary auth
    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken);
    }
    return { user: response.user, session: { access_token: response.accessToken } };
  },

  async signOut() {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with client-side cleanup even if server logout fails
    }
    localStorage.removeItem('authToken');
  },

  async resetPassword(email) {
    return api.post('/api/auth/reset-password', { email });
  },

  async updatePassword(newPassword) {
    return api.put('/api/auth/update', { password: newPassword });
  },

  async getSession() {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await api.get('/api/auth/session');
      return { user: response.user, access_token: token };
    } catch (error) {
      // If token is expired, try to refresh it
      if (error.message.includes('expired')) {
        try {
          await this.refreshToken();
          const response = await api.get('/api/auth/session');
          return { user: response.user, access_token: token };
        } catch (refreshError) {
          localStorage.removeItem('authToken');
          return null;
        }
      }
      localStorage.removeItem('authToken');
      return null;
    }
  },

  async getUser() {
    try {
      const response = await api.get('/api/auth/session');
      return response.user;
    } catch (error) {
      return null;
    }
  },

  async refreshToken() {
    try {
      const response = await api.post('/api/auth/refresh', {});
      if (response.accessToken) {
        localStorage.setItem('authToken', response.accessToken);
      }
      return response;
    } catch (error) {
      localStorage.removeItem('authToken');
      throw error;
    }
  }
};