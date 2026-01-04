import axios from "axios";

// Tạo API instance với axios
export const api = axios.create({
  baseURL: process.env.NODE_ENV === "development" ? "http://localhost:3001/api" : process.env.NEXT_PUBLIC_API_URL + "/api",
  withCredentials: true, // Cho phép gửi cookies
});

// Biến lưu CSRF token
let csrfToken: string | null = null;

// Hàm lấy CSRF token
export const getCsrfToken = async () => {
  try {
    const response = await api.get("/admin/csrf-token");
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Lỗi khi lấy CSRF token:", error);
    return null;
  }
};

// Interceptor để thêm token vào header khi có yêu cầu
api.interceptors.request.use(
  async (config) => {
    // Lấy token từ cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    if (typeof window !== "undefined") {
      const token = getCookie("adminToken");
      if (token) {
        config.headers["x-admin-token"] = token;
      }

      // Thêm CSRF token vào header nếu có
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Nếu là lỗi CSRF, thử lấy token mới
    if (error.response?.status === 403 && error.response?.data?.msg === "CSRF token không hợp lệ") {
      await getCsrfToken();
      // Thử lại request với token mới
      const config = error.config;
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
        return api(config);
      }
    }

    // Kiểm tra nếu là lỗi 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Nếu ở client-side, xóa cookie và chuyển về trang login
      if (typeof window !== "undefined") {
        document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie = "adminTokenExpires=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        // Chuyển hướng nếu không ở trang login
        if (!window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
