import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// Upload CV (cho intern/user)
export async function uploadCV({ file }) {
  const formData = new FormData();
  formData.append("file", file);
  const email = useAuthStore.getState().user?.email;
  if (email) formData.append("uploaderEmail", email);

  const response = await api.post("/cv/upload", formData);
  return response.data;
}

// Lấy CV của chính mình
export async function getMyCVs() {
  const email = useAuthStore.getState().user?.email;
  if (!email) return [];
  const response = await api.get("/cv/my", { params: { email } });
  const rows = response.data?.data || [];
  return rows.map((r) => ({
    id: r.cv_id,
    fileName: r.filename,
    fileType: r.file_type,
    uploadedAt: r.uploaded_by,
    status: r.status,
    storagePath: r.storage_path,
  }));
}

// Lấy CV chờ duyệt (cho HR)
export async function getPendingCVs() {
  const response = await api.get("/cv/pending");
  const rows = response.data?.data || [];
  return rows.map((r) => ({
    id: r.cv_id,
    fileName: r.filename,
    fileType: r.file_type,
    uploadedAt: r.uploaded_by,
    status: r.status,
    internId: r.intern_id,
    internName: r.intern_name,
    phone: r.phone,
    university: r.university_name,
  }));
}

// Lấy CV theo intern
export async function getCVsByIntern(internId) {
  const response = await api.get(`/cv/intern/${internId}`);
  return response.data.data || [];
}

// Duyệt CV
export async function approveCV(id) {
  return api.put(`/cv/${id}/approve`);
}

// Từ chối CV
export async function rejectCV(id) {
  return api.put(`/cv/${id}/reject`);
}

// Thống kê CV
export async function getCVStats() {
  const response = await api.get("/cv/stats");
  return response.data.data;
}

// Xóa CV theo id
export async function deleteCV(id) {
  const response = await api.delete(`/cv/${id}`);
  return response.data;
}
