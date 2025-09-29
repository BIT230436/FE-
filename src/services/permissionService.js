import api from "./apiClient";

// Định nghĩa nhóm quyền (cho UI)
export const PERMISSION_GROUPS = {
  Dashboard: ["VIEW_DASHBOARD"],
  "Quản lý thực tập": [
    "VIEW_INTERNSHIPS",
    "CREATE_INTERNSHIP",
    "EDIT_INTERNSHIP",
    "DELETE_INTERNSHIP",
  ],
  "Quản lý sinh viên": [
    "VIEW_STUDENTS",
    "CREATE_STUDENT",
    "EDIT_STUDENT",
    "DELETE_STUDENT",
  ],
  "Quản lý người dùng": ["MANAGE_USERS"],
  "Quản lý phân quyền": ["MANAGE_PERMISSIONS"],
  "Báo cáo": ["VIEW_REPORTS"],
};

// Lấy tất cả permissions
export async function getAllPermissions() {
  const response = await api.get("/admin/permissions");
  return response.data;
}

// Lấy tất cả roles
export async function getAllRoles() {
  const response = await api.get("/admin/permissions/roles");
  return response.data;
}

// Lấy permissions của một role
export async function getRolePermissions(roleId) {
  const response = await api.get(`/admin/permissions/role/${roleId}`);
  return response.data;
}

// Lấy tất cả roles với permissions (cho Permissions page)
export async function getAllRolePermissions() {
  const roles = await getAllRoles();
  const result = { roles: [] };

  for (const role of roles) {
    const roleDetail = await getRolePermissions(role.id);
    result.roles.push({
      role: role.name,
      permissions: roleDetail.permissions.map((p) => p.name),
    });
  }

  return result;
}

// Cập nhật permissions cho role
export async function updateRolePermissions(roleName, permissions) {
  // Lấy ID của role từ tên
  const roles = await getAllRoles();
  const role = roles.find((r) => r.name === roleName);
  if (!role) throw new Error(`Role ${roleName} không tồn tại`);

  // Lấy tất cả permissions để map tên -> ID
  const allPermissions = await getAllPermissions();
  const permissionIds = permissions
    .map((permName) => {
      const perm = allPermissions.find((p) => p.name === permName);
      return perm ? perm.id : null;
    })
    .filter(Boolean);

  const response = await api.put(`/admin/permissions/role/${role.id}`, {
    permissionIds,
  });
  return response.data;
}