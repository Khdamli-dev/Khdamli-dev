import axios from "axios";
import * as SecureStore from "expo-secure-store";
import CONFIG from "@/config";

const apiClient = axios.create({
<<<<<<< HEAD
  baseURL: "http://192.168.213.224:8000",
=======
  baseURL: CONFIG.API_URL
>>>>>>> origin/main
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
