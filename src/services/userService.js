import api from './api';

export const userService = {
  async searchUsers(query) {
    return api.get(`/users/search?q=${encodeURIComponent(query)}`);
  },

  async getSuggestions() {
    return api.get('/users/suggestions');
  },

  async getUserByUsername(username) {
    return api.get(`/users/${encodeURIComponent(username)}`);
  },

  async updateProfile(profileData) {
    return api.put('/users/me', profileData);
  },

  async getUserPosts(username, page = 1, limit = 10) {
    return api.get(`/users/${encodeURIComponent(username)}/posts?page=${page}&limit=${limit}`);
  },

  async getUserFollowers(username) {
    return api.get(`/users/${encodeURIComponent(username)}/followers`);
  },

  async getUserFollowing(username) {
    return api.get(`/users/${encodeURIComponent(username)}/following`);
  },

  async getFollowStatus(username) {
    return api.get(`/users/${encodeURIComponent(username)}/follow-status`);
  },

  async followUser(userId) {
    return api.post(`/users/${userId}/follow`);
  },

  async unfollowUser(userId) {
    return api.delete(`/users/${userId}/follow`);
  }
};
