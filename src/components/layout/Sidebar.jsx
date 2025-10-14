import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./Sidebar.css"; // CSS

export default function Sidebar({ collapsed, setCollapsed }) {
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

  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  // Lấy chữ cái đầu tiên của tên (nếu có)
  const initial = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : "?";

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Nút bật/tắt menu */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "☰" : "←"}
      </button>

      {/* Header chữ Menu */}
      <div className="sidebar-header">
        {!collapsed && "Menu"}
      </div>

      {/* Thông tin User */}
      <div
        className={`sidebar-user ${collapsed ? "collapsed" : ""}`}
        onClick={() => handleNavigate("/profile")}
        style={{ cursor: "pointer" }}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="sidebar-avatar"
          />
        ) : (
          <div className="sidebar-avatar-initial">{initial}</div>
        )}

        {!collapsed && (
          <div>
            <div className="sidebar-user-name">
              {user?.fullName || "Người dùng"}
            </div>
            <div className="sidebar-user-role">
              {user?.role || "Admin"}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <div key={item.label} className="sidebar-nav-item">
            <button
              className="sidebar-nav-btn"
              onClick={() =>
                item.submenuItems
                  ? toggleSubmenu(item.label)
                  : handleNavigate(item.path)
              }
              title={collapsed ? item.label : ""}
            >
              <span className="sidebar-nav-icon" style={{ fontSize: collapsed ? "28px" : "16px" }}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span>{item.label}</span>
                  {item.submenuItems && (
                    <span className="sidebar-nav-arrow">
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
                <div className="sidebar-submenu">
                  {item.submenuItems.map((sub) => (
                    <button
                      key={sub.path}
                      className="sidebar-submenu-btn"
                      onClick={() => handleNavigate(sub.path)}
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
      <div className="sidebar-logout">
        <button
          className="sidebar-logout-btn"
          onClick={handleLogout}
        >
          {collapsed ? "⎋" : "Đăng xuất"}
        </button>
      </div>
    </div>
  );
}
