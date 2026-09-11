import axios from "axios";

let getClerkToken = null;

export const setCLerkTokenGetter = (tokenGetter) => {
  getClerkToken = tokenGetter;
};

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use(async (config) => {
  const token = getClerkToken ? await getClerkToken() : null;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
