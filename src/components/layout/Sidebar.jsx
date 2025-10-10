import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

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
    {
      label: "Hợp đồng",
      icon: "📑",
      requiredRoles: ["HR", "ADMIN"],
      submenuItems: [
        { label: "Tải hợp đồng", path: "/hr/contract-upload" },
        { label: "Danh sách hợp đồng", path: "/hr/contract-list" },
      ],
    },
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
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

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
      {/* Nút bật/tắt menu */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
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
        }}
      >
        {collapsed ? "☰" : "←"}
      </button>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "60px 0 10px 0" }}>
        {/* Avatar user như 1 menu item */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: collapsed ? "0" : "10px",
            padding: collapsed ? "12px 0" : "12px 20px",
            cursor: "pointer",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <img
            src={user?.avatar || "/default-avatar.png"}
            alt="avatar"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          {!collapsed && (
            <span style={{ fontWeight: "500", color: "#333" }}>
              {user?.name || "Người dùng"}
            </span>
          )}
        </div>

        {/* Menu item khác */}
        {visibleItems.map((item) => (
          <div key={item.label}>
            <button
              onClick={() =>
                item.submenuItems
                  ? toggleSubmenu(item.label)
                  : handleNavigate(item.path)
              }
              style={{
                width: "100%",
                padding: collapsed ? "12px 0" : "12px 20px",
                border: "none",
                background: "none",
                display: "flex",
                alignItems: "center",
                gap: collapsed ? "0" : "10px",
                fontSize: "14px",
                cursor: "pointer",
                color: "#333",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
              title={collapsed ? item.label : ""}
            >
              <span style={{ fontSize: collapsed ? "28px" : "16px" }}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span>{item.label}</span>
                  {item.submenuItems && (
                    <span style={{ marginLeft: "auto" }}>
                      {openSubmenu === item.label ? "▲" : "▼"}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Submenu */}
            {!collapsed &&
              item.submenuItems &&
              openSubmenu === item.label && (
                <div
                  style={{
                    marginLeft: "40px",
                    borderLeft: "2px solid #ddd",
                    paddingLeft: "10px",
                  }}
                >
                  {item.submenuItems.map((sub) => (
                    <button
                      key={sub.path}
                      onClick={() => handleNavigate(sub.path)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "none",
                        background: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        fontSize: "13px",
                        color: "#555",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f0f0f0")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
          </div>
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
          }}
        >
          {collapsed ? "⎋" : "Đăng xuất"}
        </button>
      </div>
    </div>
  );
}
