import API from './api';

export const storyService = {

  async getStories() {
    const response = await API.get('/api/stories');
    return response.data.data;
  },

  async createStory(storyData) {
    const response = await API.post('/api/stories', storyData);
    return response.data.data;
  },

  async uploadMedia(file) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await API.post('/api/stories/upload', formData);
    return response.data;
  },

  async updateStory(storyId, updates) {
    const response = await API.patch(`/api/stories/${storyId}`, updates);
    return response.data.data;
  },

  async deleteStory(storyId) {
    await API.delete(`/api/stories/${storyId}`);
  },

  async likeStory(storyId) {
 
    const response  = await API.post(`/api/stories/${storyId}/like`);

    return response.data.data;
  },

  async viewStory(storyId) {
     const response  = await API.post(`/api/stories/${storyId}/view`);
    return response.data.data;
  },

  async saveStory(storyId,userId) {
     const response  = await API.post(`/api/stories/${storyId}/save`, {userId});
    return response.data.isSaved;
  },

  async createResponse(storyId,text) {

     const response  = await API.post(`/api/stories/${storyId}/responses`, {text});
    return response.data.data;
  },

  async getResponses(storyId) {
    const response = await API.get(`/api/stories/${storyId}/responses`);
    return response.data.data;
  },

  async shareStory(storyId, shareType = 'copy_link') {
    try {
      const response = await API.post(`/api/stories/${storyId}/share`, { shareType });
      return response.data?.data || { storyId, shareType, sharedAt: new Date().toISOString() };
    } catch (error) {
      return { storyId, shareType, sharedAt: new Date().toISOString(), fallback: true };
    }
  },

 
};
