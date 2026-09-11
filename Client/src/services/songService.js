import API from "./api";

export const songService = {
  async getSongs(category = "All") {
    const params = category && category !== "All" ? { category } : {};
    const response = await API.get("/api/songs", { params });
    return response.data.data;
  },
  async getSong(id) {
    const response = await API.get(`/api/songs/${id}`);
    return response.data.data;
  },
  async saveSong(id) {
    const response = await API.post(`/api/songs/${id}/save`);
    return response.data.data;
  },
  async unsaveSong(id) {
    const response = await API.delete(`/api/songs/${id}/save`);
    return response.data.data;
  },
};
