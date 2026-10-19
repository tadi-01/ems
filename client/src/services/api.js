import axios from "axios";
import { clearLogin } from "./session";

// The backend address. When the app is built it comes from VITE_API_URL (set in
// Vercel); on a developer's computer it falls back to the local server.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Adds the saved JWT to each request that needs authentication.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clears expired sessions without treating an incorrect login password as expiry.
api.interceptors.response.use((response) => response, (error) => {
  const path = error.config?.url;
  if (error.response?.status === 401 && !["/auth/login", "/auth/register"].includes(path)) {
    clearLogin();
    window.dispatchEvent(new Event("ems-session-expired"));
  }
  return Promise.reject(error);
});

export default api;
