import api from './api';

export const authService = {
  async register(data) {
    return api.post('/auth/register', data);
  },

  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async changePassword(passwords) {
    return api.put('/auth/change-password', passwords);
  }
};
