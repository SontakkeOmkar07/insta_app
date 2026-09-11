import API from './api';


  export const postService = {

    async getPosts() {
      const response = await API.get('/api/posts');
      return response.data.data;
    },

    async getPostById(postId) {
      const response = await API.get(`/api/posts/${postId}`);
      return response.data.data;
    },

    async createPost(postData) {
      const response = await API.post('/api/posts', postData);
      return response.data.data;
    },

    async updatePost(postId, updates) {
      const response = await API.patch(`/api/posts/${postId}`, updates);
      return response.data.data;
    },

    async deletePost(postId) {
      await API.delete(`/api/posts/${postId}`);
    },

    async likePost(userId,postId) {
      const response = await API.post(`/api/posts/${postId}/like`, {userId});
      return response.data.data;
    },

    async savePost(userId,postId) {

      const response = await API.post(`/api/posts/${postId}/save`, {userId});

      return response.data.isSaved;
  
    },


     async sharePost(postId) {
   

      const response = await API.post(`/api/posts/${postId}/share`, {userId})
  },

  }







 

 



