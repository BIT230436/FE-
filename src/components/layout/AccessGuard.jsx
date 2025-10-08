import { useAuthStore } from "../../store/authStore";

export default function AccessGuard({
  requiredPermissions = [],
  requiredRoles = [],
  children,
}) {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  // Dữ liệu từ store
  const userRole = user.role;
  const userPermissions = user.permissions || [];

  // ✅1) Nếu có requiredPermissions → ưu tiên kiểm tra permission
  if (requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );
    if (!hasPermission) {
      return <div style={{ padding: 24 }}>Bạn không có quyền truy cập.</div>;
    }
    return children;
  }

  // ✅2) Nếu CHƯA có permission cho chức năng đó → fallback sang role
  if (requiredRoles.length > 0) {
    if (!requiredRoles.includes(userRole)) {
      return <div style={{ padding: 24 }}>Bạn không có quyền truy cập.</div>;
    }
    return children;
  }

  // ✅3) Không yêu cầu gì thì cho qua
  return children;
}
