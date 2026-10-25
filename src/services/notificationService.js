import api from './api';

export const notificationService = {
  async getNotifications(page = 1, limit = 20) {
    return api.get(`/notifications?page=${page}&limit=${limit}`);
  },

  async markAsRead(notificationId) {
    return api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead() {
    return api.patch('/notifications/read-all');
  }
};
