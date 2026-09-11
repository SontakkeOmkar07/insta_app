import API from "./api";

export const messageService = {
  async getConversation(userId) {
    const response = await API.get(`/api/messages/${userId}`);
    return response.data.data;
  },

  async createMessage(receiverId, text, storyId = null, reaction="") {
    const response = await API.post("/api/messages", { receiverId, text, storyId, reaction });
    return response.data.data;
  },
};
