import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname !== "localhost" ? "/api" : "http://localhost:5000/api"),
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioId");
      localStorage.removeItem("usuarioCpf");
      localStorage.removeItem("usuarioEmail");
      localStorage.removeItem("usuarioNome");
    }
    return Promise.reject(error);
  }
);

export default api;