import api from "./apiClient";

// Lấy danh sách thực tập sinh
export async function getInternships(filters = {}) {
  const params = new URLSearchParams();

  if (filters.q) params.append("q", filters.q);
  if (filters.school) params.append("school", filters.school);
  if (filters.major) params.append("major", filters.major);
  if (filters.status) params.append("status", filters.status);
  if (filters.page !== undefined) params.append("page", filters.page);
  if (filters.size) params.append("size", filters.size);

  const { data } = await api.get(`/intern-profiles?${params.toString()}`);
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
  const { data } = await api.get("/internships/stats");
  return data;
}

// Lấy thống kê thực tập sinh theo trạng thái
export async function getInternStatusStats() {
  const { data } = await api.get("/intern-profiles/stats/status");
  return data.data || [];
}
