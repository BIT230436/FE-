import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "../../pages/shared/list.css";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    console.log('Dashboard - Current user:', user);
    // Chỉ USER mới bị chuyển hướng, INTERN có thể xem Dashboard
    if (user?.role === "USER") {
      console.log('Redirecting USER to upload-documents');
      navigate("/upload-documents", { replace: true });
    }
  }, [user, navigate]);

  // Chỉ USER mới không được xem Dashboard
  if (user?.role === "USER") {
    return (
      <div className="dashboard-container center">
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }

  // Demo số liệu, dùng ký tự unicode
  const stats = [
    {
      label: "Thực tập sinh",
      value: 128,
      icon: "🎓",
      bg: "#eaf3ff",
    },
    {
      label: "Nhân sự",
      value: 12,
      icon: "👔",
      bg: "#eafbe7",
    },
    {
      label: "Hồ sơ",
      value: 245,
      icon: "📄",
      bg: "#ffeaea",
    },
    {
      label: "Người dùng",
      value: 37,
      icon: "👥",
      bg: "#eaf3ff",
    },
  ];

  // Thay thế truy cập nhanh bằng thông báo, mẹo, hoặc lịch sử hoạt động
  const tips = [
    { icon: "💡", text: "Bạn có thể cập nhật thông tin cá nhân tại trang hồ sơ." },
    { icon: "📅", text: "Kiểm tra lịch thực tập và các sự kiện sắp tới." },
    { icon: "🔔", text: "Luôn theo dõi thông báo mới từ hệ thống." },
    { icon: "🛡️", text: "Bảo mật tài khoản bằng cách đổi mật khẩu định kỳ." },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-desc">
        Chào mừng <strong>{user?.fullName}</strong> ({user?.role})
      </p>
      <div style={{ marginTop: 24, marginBottom: 32, display: "flex", gap: 24, flexWrap: "wrap" }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              minWidth: 180,
              flex: "1 1 180px",
              background: stat.bg,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 32 }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 15, color: "#555" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: "#2b7cff" }}>Mẹo sử dụng hệ thống</h2>
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {tips.map((tip, idx) => (
            <li key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{tip.icon}</span>
              <span style={{ fontSize: 15 }}>{tip.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
        <strong>Debug info:</strong> User role = {user?.role || 'undefined'}
      </div>

      {user?.role === "ADMIN" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Quản lý hệ thống</h3>
          <p>Bạn có thể quản lý người dùng, phân quyền và xem báo cáo.</p>
        </div>
      )}
      {user?.role === "HR" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Quản lý nhân sự</h3>
          <p>Bạn có thể quản lý thực tập sinh, duyệt hồ sơ và theo dõi tiến độ.</p>
        </div>
      )}
      {user?.role === "INTERN" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Thực tập sinh</h3>
          <p>Chào mừng bạn đến với chương trình thực tập! Bạn có thể xem profile và theo dõi tiến độ thực tập của mình.</p>
        </div>
      )}
    </div>
  );
}
