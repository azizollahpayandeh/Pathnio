import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// افزودن توکن به هدر در هر درخواست
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

export default api; 