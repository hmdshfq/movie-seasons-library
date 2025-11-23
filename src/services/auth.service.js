import { api } from '../lib/api';

export const authService = {
  async signUp(email, password, name = '') {
    const { user, token } = await api.post('/api/auth/register', { email, password, name });
    localStorage.setItem('authToken', token);
    return { user, session: { access_token: token } };
  },

  async signIn(email, password) {
    const { user, token } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('authToken', token);
    return { user, session: { access_token: token } };
  },

  async signOut() {
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
    if (!token) return null;

    try {
      const response = await api.get('/api/auth/session');
      return { user: response.user, access_token: token };
    } catch (error) {
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
  }
};