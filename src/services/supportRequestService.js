// src/services/supportRequestService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// Lấy ID intern hiện tại
function getCurrentInternId() {
  const { user } = useAuthStore.getState();
  if (user?.role !== "INTERN" || !user.internId) {
    throw new Error(
      "Không tìm thấy thông tin thực tập sinh. Vui lòng đăng nhập lại!"
    );
  }
  return user.internId;
}

/**
 * Lấy danh sách yêu cầu hỗ trợ của thực tập sinh hiện tại
 * @param {object} filters - Bộ lọc (vd: status)
 * @returns {Promise<Array>}
 */
export const getMySupportRequests = async (filters = {}) => {
  try {
    const internId = getCurrentInternId();
    const params = { ...filters };
    const response = await api.get(`/support-requests/intern/${internId}`, {
      params,
    });
    // Giả sử API trả về { success: true, data: [...] }
    return response.data?.data || [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách yêu cầu:", error);
    throw error.response?.data || new Error("Không thể tải danh sách yêu cầu.");
  }
};

/**
 * Tạo yêu cầu hỗ trợ mới
 * @param {object} requestData - Dữ liệu yêu cầu
 * @param {string} requestData.type - Loại yêu cầu (vd: 'CERTIFICATE', 'DOCUMENT', 'OTHER')
 * @param {string} requestData.description - Mô tả chi tiết
 * @param {File} [requestData.attachment] - File đính kèm (optional)
 * @returns {Promise<object>}
 */
export const createSupportRequest = async ({
  type,
  description,
  attachment,
}) => {
  try {
    const internId = getCurrentInternId();
    const formData = new FormData();
    formData.append("internId", internId);
    formData.append("type", type);
    formData.append("description", description);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    const response = await api.post("/support-requests", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Quan trọng khi có file upload
      },
    });
    // Giả sử API trả về { success: true, message: "...", data: {...} }
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu:", error);
    throw error.response?.data || new Error("Không thể tạo yêu cầu.");
  }
};

// --- Các hàm khác có thể thêm sau (lấy chi tiết, hủy yêu cầu...) ---
