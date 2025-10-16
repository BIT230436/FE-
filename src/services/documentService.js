import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// Upload tài liệu (cho intern/user)
export async function uploadMyDoc({ type, file }) {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);
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
    action,
    note,
  });
}

// Thống kê tài liệu
export async function getDocStats() {
  const response = await api.get("/documents/stats");
  return response.data.data;
}

// Upload tài liệu cho 1 thực tập sinh cụ thể (HR)
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

// services/documentService.js
// Upload hợp đồng lên Cloudinary
export async function uploadToCloud({ internProfileId, file, hrId }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("internProfileId", internProfileId); // phải match với BE
  formData.append("hrId", hrId);

  const { data } = await api.post("/documents/upload_cloud", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// 📥 Lấy danh sách URL hợp đồng theo internId
export async function getDocUrlsByIntern(internId) {
  const response = await api.get(`/documents/get-url/${internId}`);
  return response.data;
}

export async function acceptDocument(documentId, userId) {
  const response = await api.put(`/documents/${documentId}/accept`, { userId });
  return response.data;
}


export async function getAllContracts() {
  const response = await api.get("/documents/contracts");
  const rows = response.data || [];

  // Trả về đúng key như API để component dùng trực tiếp
  return rows.map((r) => ({
    intern_id: r.intern_id,
    intern_name: r.intern_name,
    document_id: r.document_id,
    file_name: r.file_name,
    file_url: r.file_url,
    status: r.status,
    uploaded_at: r.uploaded_at,
    hr_name: r.hr_name,
  }));
}