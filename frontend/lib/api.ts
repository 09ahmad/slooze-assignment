import axios, { AxiosHeaders } from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      const headers = AxiosHeaders.from(config.headers);
      headers.set("Authorization", `Bearer ${token}`);
      config.headers = headers;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error?.response?.status === 401) {
      window.localStorage.removeItem("token");
      document.cookie = "token=; Max-Age=0; path=/";
      document.cookie = "role=; Max-Age=0; path=/";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

