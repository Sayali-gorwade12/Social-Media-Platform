import api from './api';

export const postService = {
  async getPosts(page = 1, limit = 10, feed = 'all') {
    return api.get(`/posts?page=${page}&limit=${limit}&feed=${feed}`);
  },

  async getPostById(postId) {
    return api.get(`/posts/${postId}`);
  },

  async createPost(postData) {
    return api.post('/posts', postData);
  },

  async updatePost(postId, postData) {
    return api.put(`/posts/${postId}`, postData);
  },

  async deletePost(postId) {
    return api.delete(`/posts/${postId}`);
  },

  async likePost(postId) {
    return api.post(`/posts/${postId}/like`);
  },

  async unlikePost(postId) {
    return api.delete(`/posts/${postId}/like`);
  }
};
