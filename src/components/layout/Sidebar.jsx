import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import PropTypes from "prop-types";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleNavigate = (path) => navigate(path);
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const userRole = user?.role;
  const userPermissions = user?.permissions || [];

  const menuItems = [
    { label: "Dashboard", path: "/", icon: "📊" },
    { label: "Thực tập", path: "/internships", icon: "💼", requiredPermissions: ["VIEW_INTERNSHIPS"] },
    { label: "Quản lý người dùng", path: "/admin/users", icon: "👥", requiredPermissions: ["MANAGE_USERS"] },
    { label: "Duyệt hồ sơ", path: "/hr/documents", icon: "🗂️", requiredRoles: ["HR", "ADMIN"] },
    { label: "Phân quyền", path: "/admin/permissions", icon: "🔐", requiredPermissions: ["MANAGE_PERMISSIONS"] },
    { label: "Tải hợp đồng", path: "/hr/contract-upload", icon: "📑", requiredRoles: ["HR", "ADMIN"] },
    { label: "Nộp hồ sơ", path: "/upload-documents", icon: "📄", requiredRoles: ["USER"] },
    { label: "Hồ sơ của tôi", path: "/my-documents", icon: "📝", requiredRoles: ["USER"] },
    { label: "Hợp đồng của tôi", path: "/my-contract", icon: "📃", requiredRoles: ["INTERN"] },
  ];

  const visibleItems = menuItems.filter((item) => {
    if (item.requiredPermissions?.length) {
      return item.requiredPermissions.some((p) => userPermissions.includes(p));
    }
    if (item.requiredRoles?.length) {
      return item.requiredRoles.includes(userRole);
    }
    return true;
  });

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: collapsed ? "70px" : "250px",
        height: "100vh",
        backgroundColor: "rgba(226, 224, 235, 0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "2px 0 8px rgba(22,22,23,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 999,
        borderTopRightRadius: "16px",
        borderBottomRightRadius: "16px",
        transition: "width 0.3s",
        overflow: "hidden",
      }}
    >
      {/* Collapse button: Hamburger/mũi tên */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px", // Góc trong cùng bên trái
          width: "35px",
          height: "35px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#2f3640",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {collapsed ? (
          // Hamburger 3 gạch khi thu
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "18px" }}>
            <span style={{ width: "20px", height: "2px", backgroundColor: "#fff", borderRadius: "1px" }}></span>
            <span style={{ width: "20px", height: "2px", backgroundColor: "#fff", borderRadius: "1px" }}></span>
            <span style={{ width: "20px", height: "2px", backgroundColor: "#fff", borderRadius: "1px" }}></span>
          </div>
        ) : (
          // Mũi tên khi mở rộng
          "←"
        )}
      </button>

      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid rgba(229,229,229,0.5)",
          textAlign: "center",
          fontWeight: "600",
          fontSize: "18px",
        }}
      >
        {!collapsed && "Menu"}
      </div>

      {/* User Info */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "rgba(255,255,255,0.4)",
          borderRadius: "12px",
          margin: "8px",
          justifyContent: collapsed ? "center" : "flex-start",
          transition: "all 0.3s",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            minWidth: "40px",
            minHeight: "40px",
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
          }}
        >
          {!user?.avatar && (user?.fullName?.charAt(0)?.toUpperCase() || "U")}
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>{user?.fullName}</div>
            <div style={{ fontSize: "12px", color: "#444" }}>{user?.role}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "10px 0" }}>
        {visibleItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            style={{
              width: "100%",
              padding: collapsed ? "12px 0" : "12px 20px",
              border: "none",
              background: "none",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: collapsed ? "0" : "10px",
              fontSize: "14px",
              cursor: "pointer",
              color: "#333",
              justifyContent: collapsed ? "center" : "flex-start",
              position: "relative",
              transition: "all 0.3s",
            }}
            title={collapsed ? item.label : ""}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(255,255,255,0.3)")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            <span
              style={{
                fontSize: collapsed ? "28px" : "16px", // Icon lớn khi thu
                transition: "font-size 0.3s",
              }}
            >
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(229,229,229,0.5)" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: "rgba(220,53,69,0.9)",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontWeight: "500",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(200,35,51,0.95)")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "rgba(220,53,69,0.9)")}
          title={collapsed ? "Đăng xuất" : ""}
        >
          {collapsed ? "⎋" : "Đăng xuất"}
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          fontSize: "12px",
          color: "#444",
          textAlign: "center",
          display: collapsed ? "none" : "block",
        }}
      >
        Quản lý Thực tập v1.0
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
