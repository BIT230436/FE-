import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleNavigate = (path) => {
    navigate(path);
    onClose(); // Đóng sidebar sau khi navigate
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
    onClose(); // Đóng sidebar sau khi logout
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: "📊",
      roles: ["ADMIN", "HR", "MENTOR", "INTERN"],
    },
    {
      label: "Thực tập",
      path: "/internships",
      icon: "💼",
      roles: ["ADMIN", "HR"],
    },
    {
      label: "Quản lý người dùng",
      path: "/admin/users",
      icon: "👥",
      roles: ["ADMIN"],
    },
    // src/components/layout/Sidebar.jsx
    {
      label: "Duyệt hồ sơ",
      path: "/hr/documents",
      icon: "🗂️",
      roles: ["HR", "ADMIN"],
    },
    {
      label: "Tải hợp đồng",
      path: "/hr/contract-upload",
      icon: "📑",
      roles: ["HR", "ADMIN"],
    },

    {
      label: "Phân quyền",
      path: "/admin/permissions",
      icon: "🔐",
      roles: ["ADMIN"],
    },
    {
      label: "Nộp hồ sơ",
      path: "/upload-documents",
      icon: "📄",
      roles: ["USER"],
    },
    {
      label: "Hồ sơ của tôi",
      path: "/my-documents",
      icon: "📝",
      roles: ["USER"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 998,
          }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: isOpen ? 0 : "-280px",
          width: "280px",
          height: "100vh",
          backgroundColor: "#fff",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
          zIndex: 999,
          transition: "left 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            Menu
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
            }}
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <button
          onClick={() => handleNavigate("/profile")}
          style={{
            width: "100%",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#f8f9fa",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#e9ecef";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#f8f9fa";
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: user?.avatar ? "transparent" : "#007bff",
              backgroundImage: user?.avatar ? `url(${user.avatar})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              flexShrink: 0,
              border: "1px solid #e5e5e5",
            }}
          >
            {!user?.avatar && (user?.fullName?.charAt(0)?.toUpperCase() || "U")}
          </div>

          {/* User Details */}
          <div style={{ textAlign: "left", flex: 1 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "4px",
                color: "#333",
              }}
            >
              {user?.fullName}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>{user?.role}</div>
          </div>
        </button>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: "16px 0" }}>
          {visibleItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              style={{
                width: "100%",
                padding: "12px 20px",
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px",
                color: "#333",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e5e5" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #dc3545",
              backgroundColor: "#dc3545",
              color: "white",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#c82333";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#dc3545";
            }}
          >
            {/* <span>🚪</span> */}
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            fontSize: "12px",
            color: "#666",
            textAlign: "center",
          }}
        >
          Quản lý Thực tập v1.0
        </div>
      </div>
    </>
  );
}
