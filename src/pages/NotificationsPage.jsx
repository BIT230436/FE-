import { useEffect, useState } from "react";
import { TbBell, TbCheck, TbAlertTriangle, TbInfoCircle } from "react-icons/tb";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Giả lập gọi API lấy thông báo
  useEffect(() => {
    setTimeout(() => {
      setNotifications([
        {
          id: 1,
          title: "Cập nhật lịch thực tập",
          message: "Lịch thực tập tuần tới đã được cập nhật.",
          type: "info",
          date: "2025-11-10 08:30",
          read: false,
        },
        {
          id: 2,
          title: "Báo cáo cuối kỳ",
          message: "Hạn nộp báo cáo thực tập là 20/11/2025.",
          type: "warning",
          date: "2025-11-08 14:00",
          read: false,
        },
        {
          id: 3,
          title: "Chúc mừng hoàn thành thực tập!",
          message: "Bạn đã hoàn thành thực tập thành công!",
          type: "success",
          date: "2025-11-05 09:00",
          read: true,
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      }))
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <TbCheck className="icon success" />;
      case "warning":
        return <TbAlertTriangle className="icon warning" />;
      default:
        return <TbInfoCircle className="icon info" />;
    }
  };

  if (loading)
    return (
      <div className="notifications-page">
        <p>Đang tải thông báo...</p>
      </div>
    );

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>
          <TbBell /> Thông báo
        </h2>
        <button onClick={markAllAsRead} className="mark-read-btn">
          Đánh dấu tất cả là đã đọc
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="empty">Không có thông báo nào</p>
      ) : (
        <ul className="notifications-list">
          {notifications.map((n) => (
            <li key={n.id} className={`notification-item ${n.read ? "read" : "unread"}`}>
              <div className="notification-icon">{getIcon(n.type)}</div>
              <div className="notification-content">
                <h4>{n.title}</h4>
                <p>{n.message}</p>
                <span className="notification-date">{n.date}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
