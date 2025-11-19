import React, { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import NotificationService from "../services/notificationService";
import { useAuthStore } from "../store/authStore";

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
      setUnreadCount(response.data || 0);
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
    <div className="min-h-screen bg-gray-50 p-6">
      {!userId ? (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vui lòng đăng nhập để xem thông báo</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Check className="w-4 h-4" />
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Không có thông báo nào
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const isUnread = notification.status === "UNREAD";
                  return (
                    <div
                      key={notification.id}
                      onClick={() =>
                        isUnread && handleMarkAsRead(notification.id)
                      }
                      className={`p-4 cursor-pointer transition-colors ${
                        isUnread
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Dot indicator for unread */}
                        <div className="flex-shrink-0 mt-1">
                          {isUnread ? (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          ) : (
                            <div className="w-2 h-2"></div>
                          )}
                        </div>

                        {/* Notification content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              isUnread
                                ? "font-semibold text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.message || notification.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                          </p>
                        </div>

                        {/* Read indicator */}
                        {!isUnread && (
                          <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
