import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// Upload tài liệu (cho intern/user)
export async function uploadMyDoc({ type, file }) {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);
  // internId sẽ được backend tự lấy từ token nếu cần
  const email = useAuthStore.getState().user?.email;
  if (email) formData.append("uploaderEmail", email);
  
  const response = await api.post("/documents/upload", formData);
  return response.data;
}

// Lấy tài liệu của chính mình (USER xem trạng thái đã duyệt hay chưa)
export async function getMyDocs() {
  const email = useAuthStore.getState().user?.email;
  if (!email) return [];
  const response = await api.get("/documents/my", { params: { email } });
  const rows = response.data?.data || [];
  return rows.map((r) => {
    const fileDetail = r.file_detail || "";
    const fileName =
      typeof fileDetail === "string" ? fileDetail.split(" (", 1)[0] : "";
    return {
      id: r.document_id,
      type: r.document_type,
      fileName,
      uploadedAt: r.uploaded_at,
      status: r.status,
      note: r.rejection_reason || "",
    };
  });
}

// Lấy tài liệu chờ duyệt (cho HR)
export async function getPendingDocs() {
  const response = await api.get("/documents/pending");
  const rows = response.data?.data || [];
  // Map BE fields -> UI shape used by DocQueue.jsx
  return rows.map((r) => {
    const fileDetail = r.file_detail || "";
    const fileName =
      typeof fileDetail === "string" ? fileDetail.split(" (", 1)[0] : "";
    return {
      id: r.document_id,
      type: r.document_type,
      fileName,
      uploadedAt: r.uploaded_at,
      status: r.status,
      note: r.rejection_reason || "",
    };
  });
}
// Lấy tài liệu theo intern
export async function getDocsByIntern(internId) {
  const response = await api.get(`/documents/intern/${internId}`);
  return response.data.data || [];
}
// Duyệt/từ chối tài liệu
export async function reviewDoc(id, action, note = "") {
  return api.put(`/documents/${id}/review`, {
    action, // "APPROVE" hoặc "REJECT"
    note,
  });
}

// Thống kê tài liệu
export async function getDocStats() {
  const response = await api.get("/documents/stats");
  return response.data.data;
}

// Upload tài liệu cho 1 thực tập sinh cụ thể (HR)
// type thường là "CONTRACT"
export async function uploadInternDoc({ internId, type, file }) {
  const formData = new FormData();
  formData.append("internId", internId);
  formData.append("type", type);
  formData.append("file", file);
  const response = await api.post("/documents/upload-for-intern", formData);
  return response.data;
}
// Xóa tài liệu theo id
export async function deleteDoc(id) {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
}

// Xác nhận hợp đồng (intern xác nhận)
export async function confirmContract(documentId) {
  const response = await api.put(`/documents/${documentId}/confirm`);
  return response.data;
}