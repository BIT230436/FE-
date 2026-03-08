// src/services/internshipService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// ✅ Lấy userId từ auth store - PHẢI EXPORT
export const getUserId = () => useAuthStore.getState().user?.id ?? null;

// ✅ Lấy role của user
const getUserRole = () => useAuthStore.getState().user?.role ?? null;

// ✅ Lấy danh sách thực tập sinh (ĐÃ CẬP NHẬT)
export async function getInternships(filters = {}) {
  const params = new URLSearchParams();

  if (filters.q) params.append("q", filters.q);
  if (filters.school) params.append("school", filters.school);
  if (filters.major) params.append("major", filters.major);
  if (filters.status) params.append("status", filters.status);
  if (filters.page !== undefined) params.append("page", filters.page);
  if (filters.size) params.append("size", filters.size);

  // ✅ TỰ ĐỘNG THÊM mentorUserId nếu user là MENTOR
  const userId = getUserId();
  const userRole = getUserRole();

  console.log("========================================");
  console.log("🔍 getInternships - DEBUG INFO");
  console.log("📝 Filters:", filters);
  console.log("👤 User ID:", userId);
  console.log("🎭 User Role:", userRole);
  console.log("========================================");

  if (userRole === "MENTOR" && userId) {
    params.append("mentorUserId", userId);
    console.log("✅ Added mentorUserId:", userId);
  } else {
    console.log("⚠️ NOT MENTOR or no userId");
    console.log("   - userRole:", userRole);
    console.log("   - userId:", userId);
  }

  const url = `/intern-profiles?${params.toString()}`;
  console.log("🌐 Final API URL:", url);
  console.log("========================================\n");

  const { data } = await api.get(url);

  // ✅ Log kết quả
  if (data.success) {
    const total = data.total || data.pagination?.totalElements || (data.data?.length || 0);
    console.log(
      `✅ Fetched ${total} interns`,
      userRole === "MENTOR" ? "(filtered by mentor)" : "(all)"
    );
  }

  return data;
}

// Tạo thực tập sinh mới
export async function createInternship(profileData) {
  const { data } = await api.post("/intern-profiles", profileData);
  return data;
}

// Cập nhật thông tin thực tập sinh
export async function updateInternship(id, profileData) {
  const { data } = await api.put(`/intern-profiles/${id}`, profileData);
  return data;
}

// Xóa thực tập sinh
export async function deleteInternship(id) {
  const { data } = await api.delete(`/intern-profiles/${id}`);
  return data;
}

// Lấy thống kê thực tập sinh
export async function getInternshipStats() {
  const { data } = await api.get("/interns/stats");
  return data;
}

// Lấy thống kê thực tập sinh theo trạng thái
export async function getInternStatusStats() {
  const { data } = await api.get("/intern-profiles/stats/status");
  return data.data || [];
}

export async function getInternPrograms() {
  const { data } = await api.get("/intern-profiles/programs");
  return data;
}