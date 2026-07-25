import axios from "axios";
import { clearAdminToken, getAdminToken } from "./auth-cookies";

export const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001") + "/api",
});

// Attach the admin token to outgoing request headers
api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers["x-admin-token"] = token;
  }
  return config;
});

// A 401 from anywhere means the token is gone or stale: drop it and bounce to login.
// Callers can therefore treat every rejection as a plain "request failed".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAdminToken();
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);
