// src/services/NotificationService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Vui lòng đăng nhập lại!");
  return user.id;
}

const NotificationService = {
  connectSSE(userId, onMessage, onError) {
    const url = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8090/api"
    }/notifications/stream/${userId}`;

    const eventSource = new EventSource(url);

    eventSource.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage && onMessage(data);
      } catch (err) {
        console.error("❌ SSE JSON parse error", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("❌ SSE connection error:", err);
      onError && onError(err);
      // Không đóng SSE để client tự reconnect
    };

    return eventSource;
  },

  /**
   * ============================
   * 📥 2. Lấy toàn bộ thông báo
   * GET /api/notifications/{userId}?status=UNREAD
   * ============================
   */
  async getNotifications(status = null) {
    const userId = getCurrentUserId();
    const params = status ? { status } : {};
    return api.get(`/notifications/${userId}`, { params });
  },

  /**
   * ============================
   * 🔢 3. Đếm số thông báo chưa đọc
   * GET /api/notifications/{userId}/unread-count
   * ============================
   */
  async getUnreadCount() {
    const userId = getCurrentUserId();
    return api.get(`/notifications/${userId}/unread-count`);
  },

  /**
   * ============================
   * 📌 4. Đánh dấu đã đọc 1 notification
   * PUT /api/notifications/{id}/read
   * ============================
   */
  async markAsRead(notificationId) {
    return api.put(`/notifications/${notificationId}/read`);
  },

  /**
   * ============================
   * 📌 5. Đánh dấu toàn bộ đã đọc
   * PUT /api/notifications/{userId}/read-all
   * ============================
   */
  async markAllAsRead() {
    const userId = getCurrentUserId();
    return api.put(`/notifications/${userId}/read-all`);
  },

  /**
   * ============================
   * 🚀 6. Gửi test notification
   * POST /api/notifications/send
   * ============================
   */
  async sendTest(payload) {
    return api.post(`/notifications/send`, payload);
  },
};

export default NotificationService;
