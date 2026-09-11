import API from "./api";



export const notificationService = {
  async getNotifications() {
    const response = await API.get('/api/notifications');
    return response.data.data;
  },

  async createNotification(userId, notificationData) {
    const response = await API.post(
      `/api/notifications/${userId}`,
      notificationData,
    );
    return response.data.data;
  },
};
