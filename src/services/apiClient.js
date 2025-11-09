import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8090/api",
  withCredentials: true, // Cho phép gửi cookies cho OAuth session
  timeout: 15000, // Timeout sau 15 giây
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
  (config) => {
    // Thêm token nếu có
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request (chỉ trong development)
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
  (response) => {
    // Log response (chỉ trong development)
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log chi tiết lỗi
    if (import.meta.env.DEV) {
      console.error("❌ Response Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Xử lý các trường hợp lỗi cụ thể
    if (error.response) {
      // Server đã trả về response với status code lỗi
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - Xóa auth và redirect về login
          console.warn("⚠️ Unauthorized - Redirecting to login");
          useAuthStore.getState().clearAuth();

          // Chỉ redirect nếu không phải đang ở trang login
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          break;

        case 403:
          // Forbidden - Không có quyền truy cập
          console.warn("⚠️ Forbidden - Access denied");
          break;

        case 404:
          // Not Found
          console.warn("⚠️ Resource not found");
          break;

        case 500:
        case 502:
        case 503:
          // Server errors
          console.error("🔥 Server error:", status);
          break;

        default:
          console.error(`❌ HTTP Error ${status}`);
      }

      // Tạo error object có cấu trúc rõ ràng
      const customError = {
        status,
        message:
          data?.message || error.response.statusText || `Error ${status}`,
        data: data,
        originalError: error,
      };

      return Promise.reject(customError);
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      // (Network error, timeout, CORS, etc.)
      console.error("⚠️ No response received from server");

      const customError = {
        status: 0,
        message:
          "Không kết nối được tới server. Vui lòng kiểm tra kết nối mạng.",
        data: null,
        originalError: error,
      };

      return Promise.reject(customError);
    } else {
      // Lỗi khi setup request
      console.error("🚨 Request setup error:", error.message);

      const customError = {
        status: -1,
        message: error.message || "Có lỗi xảy ra khi gửi request",
        data: null,
        originalError: error,
      };

      return Promise.reject(customError);
    }
  }
);

export default api;
