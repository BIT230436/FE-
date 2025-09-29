import { useEffect, useState } from "react";
import { getAllRolePermissions, updateRolePermissions, PERMISSION_GROUPS } from "../../services/permissionService";
import "./admin.css";

export default function Permissions() {
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    setError("");
    try {
      const { roles } = await getAllRolePermissions();
      const permissionsMap = {};
      roles.forEach(({ role, permissions }) => {
        permissionsMap[role] = permissions;
      });
      setRolePermissions(permissionsMap);
    } catch (e) {
      setError("Không thể tải danh sách quyền");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = async (role, permission, checked) => {
    setSaving(`${role}-${permission}`);
    setError("");
    setSuccess("");

    try {
      const currentPermissions = rolePermissions[role] || [];
      let newPermissions;
      
      if (checked) {
        newPermissions = [...currentPermissions, permission];
      } else {
        newPermissions = currentPermissions.filter(p => p !== permission);
      }

      await updateRolePermissions(role, newPermissions);
      
      setRolePermissions(prev => ({
        ...prev,
        [role]: newPermissions
      }));
      
      setSuccess(`Đã cập nhật quyền cho ${role}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError("Cập nhật quyền thất bại");
    } finally {
      setSaving(null);
    }
  };

  const isPermissionChecked = (role, permission) => {
    return rolePermissions[role]?.includes(permission) || false;
  };

  const isPermissionSaving = (role, permission) => {
    return saving === `${role}-${permission}`;
  };

  if (loading) {
    return (
      <div className="admin-center">
        <div>Đang tải...</div>
      </div>
    );
  }

  // Exclude ADMIN from the editable matrix – ADMIN is assumed to have full permissions
  const roles = Object.keys(rolePermissions).filter((r) => r !== "ADMIN");

  return (
    <div className="admin-container">
      <h1 className="admin-title">Quản lý Phân quyền</h1>
      
      <p className="admin-desc">
        Tích vào ô để cấp quyền cho vai trò tương ứng. Thay đổi sẽ được lưu tự động.
      </p>

      {error && (
        <div className="admin-alert">{error}</div>
      )}

      {success && (
        <div className="admin-alert--success">{success}</div>
      )}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr className="admin-thead-row">
              <th className="admin-th" style={{
                borderBottom: "2px solid #dee2e6",
                minWidth: "200px"
              }}>
                Quyền
              </th>
              {roles.map(role => (
                <th key={role} className="admin-th" style={{
                  textAlign: "center",
                  borderBottom: "2px solid #dee2e6",
                  minWidth: "120px"
                }}>
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
              <>
                <tr key={`group-${groupName}`}>
                  <td colSpan={roles.length + 1} className="admin-group-row">
                    {groupName}
                  </td>
                </tr>
                {permissions.map(permission => (
                  <tr key={permission} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td className="admin-td" style={{ fontSize: 14 }}>
                      {getPermissionLabel(permission)}
                    </td>
                    {roles.map(role => (
                      <td key={`${role}-${permission}`} className="admin-td" style={{
                        textAlign: "center"
                      }}>
                        <label className="admin-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isPermissionChecked(role, permission)}
                            disabled={isPermissionSaving(role, permission)}
                            onChange={(e) => handlePermissionChange(role, permission, e.target.checked)}
                            style={{ width: 18, height: 18, cursor: isPermissionSaving(role, permission) ? "not-allowed" : "pointer" }}
                          />
                          {isPermissionSaving(role, permission) && (
                            <span className="admin-checkbox-hint">
                              ...
                            </span>
                          )}
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function để hiển thị tên quyền dễ hiểu
function getPermissionLabel(permission) {
  const labels = {
    VIEW_DASHBOARD: "Xem Dashboard",
    VIEW_INTERNSHIPS: "Xem danh sách thực tập",
    CREATE_INTERNSHIP: "Tạo thực tập mới",
    EDIT_INTERNSHIP: "Chỉnh sửa thực tập",
    DELETE_INTERNSHIP: "Xóa thực tập",
    VIEW_STUDENTS: "Xem danh sách sinh viên",
    CREATE_STUDENT: "Thêm sinh viên mới",
    EDIT_STUDENT: "Chỉnh sửa sinh viên",
    DELETE_STUDENT: "Xóa sinh viên",
    MANAGE_USERS: "Quản lý người dùng",
    MANAGE_PERMISSIONS: "Quản lý phân quyền",
    VIEW_REPORTS: "Xem báo cáo",
  };
  return labels[permission] || permission;
}
