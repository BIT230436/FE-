import { useAuthStore } from "../../store/authStore";

export default function PermissionGuard({ requiredPermissions = [], children }) {
  const user = useAuthStore((s) => s.user);
  console.log("PermissionGuard - User:", user, "Required permissions:", requiredPermissions);

  if (!user) {
    console.log("PermissionGuard - No user found");
    return null;
  }

  const userPermissions = user.permissions || [];
  const hasAccess =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((perm) => userPermissions.includes(perm));

  if (!hasAccess) {
    console.log(
      "PermissionGuard - Access denied. User permissions:",
      userPermissions,
      "Required:",
      requiredPermissions
    );
    return <div style={{ padding: 24 }}>Bạn không có quyền truy cập.</div>;
  }

  console.log("PermissionGuard - Access granted");
  return children;
}
