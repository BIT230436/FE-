import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// Upload CV (cho intern/user)
export async function uploadCV({ file }) {
  const formData = new FormData();
  formData.append("file", file);
  const email = useAuthStore.getState().user?.email;
  if (email) formData.append("uploaderEmail", email);

  const response = await api.post("/cvs/upload", formData);
  return response.data;
}

// Lấy CV của chính mình
export async function getMyCVs() {
  const email = useAuthStore.getState().user?.email;
  if (!email) return [];
  const response = await api.get("/cvs/my", { params: { email } });
  const rows = response.data?.data || [];
  return rows.map((r) => ({
    id: r.cv_id,
    fileName: r.filename,
    fileType: r.file_type,
    uploadedAt: r.uploaded_at, // ✅ Dùng uploaded_at từ backend
    status: r.status,
    storagePath: r.storage_path,
  }));
}

// Lấy CV chờ duyệt (cho HR)
export async function getPendingCVs() {
  const response = await api.get("/cvs/pending");
  const rows = response.data?.data || [];
  return rows.map((r) => ({
    id: r.cv_id,
    fileName: r.filename,
    type: "CV", // ⚙️ thêm để hiển thị rõ loại tài liệu
    fileType: r.file_type,
    uploadedAt: r.uploaded_at, // ✅ Dùng uploaded_at từ backend
    status: r.status,
    storagePath: r.storage_path, // ✅ Thêm storage_path để HR có thể xem file
    internId: r.intern_id,
    internName: r.intern_name,
    userEmail: r.intern_email, // ✅ đây chính là email cần gửi
    phone: r.phone,
    university: r.university_name,
    isCV: true, // ✅ thêm flag này để ReviewModal biết đây là CV
  }));
}


// Lấy CV theo intern
export async function getCVsByIntern(internId) {
  const response = await api.get(`/cvs/intern/${internId}`);
  return response.data.data || [];
}

// HR initiates CV approval (sets status to ACCEPTING)
export async function acceptCV(id) {
  return api.put(`/cvs/${id}/accept`);
}

// HR confirms CV approval (sets status to APPROVED and sends email)
export async function confirmApproveCV(id) {
  return api.put(`/cvs/${id}/confirm-approve`);
}

// HR initiates CV rejection (sets status to REJECTING)
export async function rejectCV(id, reason = "") {
  return api.put(`/cvs/${id}/reject`, { reason });
}

// HR confirms CV rejection (sets status to REJECTED and sends email)
export async function confirmRejectCV(id, reason) {
  return api.put(`/cvs/${id}/confirm-reject`, { reason });
}

// Legacy endpoints for backward compatibility
export async function approveCV(id) {
  return api.put(`/cvs/${id}/approve`);
}

// Thống kê CV
export async function getCVStats() {
  const response = await api.get("/cvs/stats");
  return response.data.data;
}

// Xóa CV theo id
export async function deleteCV(id) {
  const response = await api.delete(`/cvs/${id}`);
  return response.data;
}

