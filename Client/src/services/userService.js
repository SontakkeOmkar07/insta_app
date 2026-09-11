import API from "./api";

export const userService = {
  async getUsers() {
    const response = await API.get("/api/users");
    return response.data.data;
  },

  async getUserById(clerkId) {
    const response = await API.get(`/api/users/${clerkId}`);
    return response.data.data;
  },

  async updateUser(clerkId, updates) {
    const response = await API.patch(`/api/users/${clerkId}`, updates);
    return response.data.data;
  },

  async followUser(currentUserId, targetUserId) {

    const response = await API.post(`/api/users/${targetUserId}/follow`, {
      currentUserId,
    
    });
    return response.data.data;
  },

  async unfollowUser(currentUserId, targetUserId) {
    const response = await API.post(`/api/users/${targetUserId}/unfollow`, {
      currentUserId,
     
    });
    return response.data.data;
  },

  // async searchUsers(query) {
  //   const response = await API.get(`/api/users?search=${query}`);
  //   return response.data;
  // },
};
