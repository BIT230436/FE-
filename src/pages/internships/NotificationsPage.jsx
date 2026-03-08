import React, { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import NotificationService from "../../services/notificationService";
import { useAuthStore } from "../../store/authStore";
import "./NotificationsPage.css";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      console.error("Không tìm thấy userId");
      setLoading(false);
      return;
    }

    loadNotifications();
    loadUnreadCount();

    // Kết nối SSE để nhận thông báo realtime
    const eventSource = NotificationService.connectSSE(
      userId,
      handleNewNotification,
      handleSSEError
    );

    return () => {
      eventSource.close();
    };
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getNotifications();
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      setUnreadCount(response.data?.count ?? 0);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleNewNotification = (newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const handleSSEError = (error) => {
    console.error("SSE Error:", error);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, status: "READ" } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, status: "READ" }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div className="notifications-page">
      {!userId ? (
        <div className="empty">
          <Bell className="icon info" style={{ marginBottom: "10px" }} />
          <p>Vui lòng đăng nhập để xem thông báo</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="notifications-header">
            <h2>
              <Bell className="icon info" />
              Thông báo
              {unreadCount > 0 && (
                <span
                  className="unread-badge"
                  style={{
                    background: "#ff4d4f",
                    color: "white",
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllAsRead} className="mark-read-btn">
                <Check
                  style={{ width: "16px", height: "16px", marginRight: "5px" }}
                />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="notifications-container">
            {loading ? (
              <div className="empty">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="empty">Không có thông báo nào</div>
            ) : (
              <ul className="notifications-list">
                {notifications.map((notification) => {
                  const isUnread = notification.status === "UNREAD";
                  return (
                    <li
                      key={notification.id}
                      onClick={() =>
                        isUnread && handleMarkAsRead(notification.id)
                      }
                      className={`notification-item ${
                        isUnread ? "unread" : "read"
                      }`}
                    >
                      {/* ICON Placeholder - Bạn có thể tùy biến icon dựa trên loại thông báo */}
                      <div className="notification-icon">
                        <Bell className="icon info" />
                      </div>

                      {/* Notification content */}
                      <div className="notification-content">
                        <h4 className={isUnread ? "unread-title" : ""}>
                          {notification.title || "Thông báo mới"}
                        </h4>
                        <p>{notification.message || notification.content}</p>
                        <span className="notification-date">
                          {new Date(notification.createdAt).toLocaleString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
