import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore.persist?.hasHydrated?.();

  // Wait for persisted auth to hydrate to avoid redirecting logged-in users on F5
  if (!hasHydrated) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        Đang tải...
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}