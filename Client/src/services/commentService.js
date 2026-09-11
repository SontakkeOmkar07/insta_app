import API from "./api";

export const commentService = {

  async getComments(postId) {
    const response = await API.get(`/api/comments/post/${postId}`);
    return response.data.data;
  },

  async createComment(data) {
    const response = await API.post('/api/comments', data );
    return response.data.data;
  },

  async updateComment(commentId, updates) {
    const response = await API.patch(`/api/comments/${commentId}`, updates);
    return response.data.data;
  },

  async deleteComment(commentId) {
    await API.delete(`/api/comments/${commentId}`);
  },

  async likeComment(commentId) {
    const response = await API.post(`/api/comments/${commentId}/like`);
    return response.data.data;
  },

}