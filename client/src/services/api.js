import axios from "axios";

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

export default api;
