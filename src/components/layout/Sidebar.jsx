import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./Sidebar.css";
import {
  TbLogout2,
  TbStar,
  TbHelpOctagon,
  TbMessageQuestion,
} from "react-icons/tb";

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const location = useLocation();
  const { pathname } = location;

  const handleNavigate = (path) => navigate(path);
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const userRole = user?.role;
  const userPermissions = user?.permissions || [];

  // --- MENU ITEMS ---
  const menuItems = [
    { label: "Dashboard", path: "/", icon: "📊" },
    {
      label: "Thực tập",
      path: "/internships",
      icon: "💼",
      requiredPermissions: ["VIEW_INTERNSHIPS"],
    },
    {
      label: "Lịch thực tập",
      path: "/intern-schedule",
      icon: "🗓️",
      requiredRoles: ["INTERN"],
    },
    {
      label: "Công việc của tôi",
      path: "/my-tasks",
      icon: "📋",
      requiredRoles: ["INTERN"],
    },
    {
      label: "Đánh giá thực tập sinh",
      path: "/mentor/evaluation",
      icon: <TbStar style={{ fontSize: "18px" }} />,
      requiredRoles: ["MENTOR"],
    },
    {
      label: "Quản lý người dùng",
      path: "/admin/users",
      icon: "👥",
      requiredPermissions: ["MANAGE_USERS"],
    },
    {
      label: "Duyệt hồ sơ",
      path: "/hr/documents",
      icon: "🗂️",
      requiredRoles: ["HR"],
    },
    {
      label: "Hợp đồng",
      icon: "📑",
      requiredRoles: ["HR"],
      submenuItems: [
        { label: "Tải hợp đồng", path: "/hr/contract-upload" },
        { label: "Danh sách hợp đồng", path: "/hr/contract-list" },
      ],
    },
    {
      label: "Nộp hồ sơ",
      path: "/upload-documents",
      icon: "📄",
      requiredRoles: ["USER"],
    },
    {
      label: "Hồ sơ của tôi",
      path: "/my-documents",
      icon: "📝",
      requiredRoles: ["USER"],
    },
    {
      label: "Hợp đồng của tôi",
      path: "/my-contract",
      icon: "📃",
      requiredRoles: ["INTERN"],
    },
    {
      label: "Chương trình TT",
      path: "/hr/internship-programs",
      icon: "🎓",
      requiredRoles: ["HR"],
    },
    {
      label: "Quản lý dự án",
      path: "/mentor/projects",
      icon: "📁",
      requiredRoles: ["MENTOR"],
    },
    {
      label: "Giao nhiệm vụ",
      path: "/mentor/tasks",
      icon: "📝",
      requiredRoles: ["MENTOR"],
    },
    {
      label: "Quản lý dự án",

      path: "/admin/mentors",
      icon: "👨‍🏫",
      requiredRoles: ["HR"],
    },
    {
      label: "Quản lý Phụ cấp",
      path: "/hr/allowances",
      icon: "💰",
      requiredRoles: ["HR"],
    },
    {
      label: "Báo cáo chuyên cần",
      path: "/hr/attendance-report",
      icon: "📊",
      requiredRoles: ["HR"],
    },
    {
      label: "Phụ cấp của tôi",
      path: "/my-allowance-history",
      icon: "💰",
      requiredRoles: ["INTERN"],
    },
    {
      label: "Yêu cầu hỗ trợ",
      path: "/support-requests",
      icon: "❓",
      requiredRoles: ["INTERN"],
    },
    {
      label: "Duyệt yêu cầu HT", // HT = Hỗ trợ
      path: "/hr/support-requests",
      icon: "📋",
      requiredRoles: ["HR"],
    },
    {
      label: "Báo cáo thực tập sinh",
      path: "/reports",
      icon: "📈",
      requiredRoles: ["HR"],
    },
    {
      label: "Báo cáo của tôi",
      path: "/report-intern",
      icon: "📝",
      requiredRoles: ["INTERN"],
    },
    {
      label: "Chấm công",
      path: "/internship-attendance",
      icon: "⏰",
      requiredRoles: ["INTERN"],
    },
    {
      label: "Xin nghỉ phép",
      path: "/internship-leave-requests",
      icon: "🛌",
      requiredRoles: ["INTERN"],
    },
    {
      label: "Duyệt nghỉ phép",
      path: "/hr/leave-approvals",
      icon: "🛎️",
      requiredRoles: ["HR"],
    },
  ];

  // --- Lọc menu theo quyền / vai trò ---
  const visibleItems = menuItems.filter((item) => {
    if (item.requiredPermissions?.length) {
      return item.requiredPermissions.some((p) => userPermissions.includes(p));
    }
    if (item.requiredRoles?.length) {
      return item.requiredRoles.includes(userRole);
    }
    return true;
  });

  // --- Quản lý submenu ---
  const getActiveSubmenuParent = () => {
    for (const item of menuItems) {
      if (item.submenuItems?.some((sub) => sub.path === pathname)) {
        return item.label;
      }
    }
    return null;
  };

  const [openSubmenu, setOpenSubmenu] = useState(getActiveSubmenuParent());

  useEffect(() => {
    const activeParent = getActiveSubmenuParent();
    if (activeParent) {
      setOpenSubmenu(activeParent);
    }
  }, [pathname]);

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  // --- Avatar ---
  const initial = user?.fullName
    ? user.fullName.trim().charAt(0).toUpperCase()
    : "?";

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Nút bật/tắt */}
      <button
        className="sidebar-toggle"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? "☰" : "⟪"}
      </button>

      {/* Header */}
      <div className="sidebar-header">{!collapsed && "Menu"}</div>

      {/* Thông tin người dùng */}
      <div
        className={`sidebar-user ${collapsed ? "collapsed" : ""}`}
        onClick={() => handleNavigate("/profile")}
        style={{ cursor: "pointer" }}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="sidebar-avatar" />
        ) : (
          <div className="sidebar-avatar-initial">{initial}</div>
        )}
        {!collapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user?.fullName || "Người dùng"}
            </div>
            <div className="sidebar-user-role">{user?.role || "Admin"}</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {visibleItems.map((item) => (
          <div key={item.label} className="sidebar-nav-item">
            <button
              className={`sidebar-nav-btn ${
                pathname === item.path ? "active" : ""
              }`}
              onClick={() =>
                item.submenuItems
                  ? toggleSubmenu(item.label)
                  : handleNavigate(item.path)
              }
              title={collapsed ? item.label : ""}
            >
              <span
                className="sidebar-nav-icon"
                style={{ fontSize: collapsed ? "28px" : "16px" }}
              >
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
            {!collapsed && item.submenuItems && openSubmenu === item.label && (
              <div className="sidebar-submenu">
                {item.submenuItems.map((sub) => (
                  <button
                    key={sub.path}
                    className={`sidebar-submenu-btn ${
                      pathname === sub.path ? "active" : ""
                    }`}
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
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          {collapsed ? <TbLogout2 /> : "Đăng xuất"}
        </button>
      </div>
    </div>
  );
}
