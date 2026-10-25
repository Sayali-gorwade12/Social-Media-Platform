import api from './api';

export const commentService = {
  async getPostComments(postId) {
    return api.get(`/posts/${postId}/comments`);
  },

  async addComment(postId, content) {
    return api.post(`/posts/${postId}/comments`, { content });
  },

  async updateComment(commentId, content) {
    return api.put(`/comments/${commentId}`, { content });
  },

  async deleteComment(commentId) {
    return api.delete(`/comments/${commentId}`);
  }
};
