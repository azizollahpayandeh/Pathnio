import axios from "axios";

// یک Base URL واحد برای همه جا (API و عکس‌ها)
const envBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://pathnio-backend.vercel.app");

export const API_BASE_URL = envBase.endsWith("/")
  ? envBase.slice(0, -1)
  : envBase;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/`,
});

// Add token to header in every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${access}`;
    }
  }
  return config;
});

// Handle response errors (like 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear invalid tokens
      if (typeof window !== "undefined") {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        // Redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;