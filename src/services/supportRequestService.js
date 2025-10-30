// src/services/supportRequestService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// Lấy ID intern hiện tại
function getCurrentInternId() {
  const { user } = useAuthStore.getState();
  // Sửa lỗi: Kiểm tra user.internId thay vì user.id cho Intern
  if (user?.role !== "INTERN" || !user.internId) {
    // Nếu không phải Intern hoặc không có internId, throw Error
    throw new Error(
      "Không tìm thấy thông tin thực tập sinh. Vui lòng đăng nhập lại!"
    );
  }
  return user.internId; // Trả về internId
}

// Lấy ID HR hiện tại
function getCurrentHrId() {
  const { user } = useAuthStore.getState();
  // Chỉ HR hoặc ADMIN mới có quyền thực hiện thao tác HR
  if (!user || (user.role !== "HR" && user.role !== "ADMIN") || !user.id) {
    console.warn(
      "User might not be HR/ADMIN or ID is missing for HR operation."
    );
    // Vẫn trả về ID nếu có, backend sẽ kiểm tra quyền cuối cùng
    return user?.id;
  }
  return user.id; // Trả về user.id thông thường cho HR/ADMIN
}

/**
 * Lấy danh sách yêu cầu hỗ trợ của thực tập sinh hiện tại
 * @param {object} filters - Bộ lọc (vd: status)
 * @returns {Promise<Array>}
 */
export const getMySupportRequests = async (filters = {}) => {
  try {
    const internId = getCurrentInternId(); // Lấy internId từ hàm đã sửa
    const params = { ...filters };
    // Gọi API đúng cho intern: /support-requests/intern/{internId}
    const response = await api.get(`/support-requests/intern/${internId}`, {
      params,
    });
    // Giả sử API trả về { success: true, data: [...] }
    return response.data?.data || [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách yêu cầu:", error);
    // Ném lỗi cụ thể hơn từ backend nếu có
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
    const internId = getCurrentInternId(); // Lấy internId từ hàm đã sửa
    const formData = new FormData();
    formData.append("internId", internId); // Gửi internId
    formData.append("type", type);
    formData.append("description", description);
    if (attachment) {
      formData.append("attachment", attachment);
    }

    // Gọi API POST /support-requests
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

// --- HÀM MỚI CHO HR ---

/**
 * HR: Lấy tất cả yêu cầu hỗ trợ (có thể lọc)
 * @param {object} filters - Bộ lọc (vd: status, type, internName)
 * @returns {Promise<Array>}
 */
export const getAllSupportRequests = async (filters = {}) => {
  try {
    // HR gọi API GET /support-requests (không cần ID)
    const response = await api.get("/support-requests", { params: filters });
    // Giả sử API trả về { success: true, data: [...] }
    // Cần kiểm tra cấu trúc response thực tế từ backend
    // Nếu backend trả về pagination thì cần lấy data từ response.data.content hoặc tương tự
    return response.data?.data || response.data?.content || [];
  } catch (error) {
    console.error("Lỗi khi tải tất cả yêu cầu:", error);
    throw error.response?.data || new Error("Không thể tải danh sách yêu cầu.");
  }
};

/**
 * HR: Cập nhật trạng thái và phản hồi cho một yêu cầu
 * @param {number} requestId - ID của yêu cầu cần cập nhật
 * @param {object} updateData - Dữ liệu cập nhật
 * @param {string} updateData.status - Trạng thái mới ('PROCESSING', 'COMPLETED', 'REJECTED')
 * @param {string} [updateData.response] - Phản hồi của HR (optional)
 * @returns {Promise<object>}
 */
export const reviewSupportRequest = async (requestId, { status, response }) => {
  try {
    const hrId = getCurrentHrId(); // Lấy ID HR/Admin
    if (!hrId) {
      // Có thể không cần throw error ở đây nếu backend tự check quyền
      console.warn(
        "HR ID not found, proceeding without it. Backend should verify."
      );
    }
    // Payload gửi lên backend
    const payload = {
      status,
      response: response || null, // Gửi null nếu response trống
      // hrId: hrId // Gửi hrId nếu backend yêu cầu trong body
    };
    // Gọi API PUT /support-requests/{requestId}/review
    // Nếu backend yêu cầu hrId trong params thay vì body:
    // const apiResponse = await api.put(`/support-requests/${requestId}/review?hrId=${hrId}`, payload);
    const apiResponse = await api.put(
      `/support-requests/${requestId}/review`,
      payload
    );

    // Giả sử API trả về { success: true, message: "...", data: {...} }
    return apiResponse.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật yêu cầu ${requestId}:`, error);
    throw error.response?.data || new Error("Không thể cập nhật yêu cầu.");
  }
};

// --- Các hàm khác có thể thêm sau (lấy chi tiết, hủy yêu cầu...) ---

/**
 * Lấy chi tiết một yêu cầu hỗ trợ (có thể dùng chung cho Intern và HR)
 * @param {number} requestId - ID của yêu cầu
 * @returns {Promise<object>}
 */
export const getSupportRequestById = async (requestId) => {
  try {
    const response = await api.get(`/support-requests/${requestId}`);
    return response.data?.data;
  } catch (error) {
    console.error(`Lỗi khi tải chi tiết yêu cầu ${requestId}:`, error);
    throw error.response?.data || new Error("Không thể tải chi tiết yêu cầu.");
  }
};

/**
 * Intern: Hủy yêu cầu hỗ trợ (nếu trạng thái cho phép, vd: PENDING)
 * @param {number} requestId - ID của yêu cầu cần hủy
 * @returns {Promise<object>}
 */
export const cancelSupportRequest = async (requestId) => {
  try {
    const internId = getCurrentInternId(); // Xác thực intern
    // Backend có thể cần internId để kiểm tra quyền hủy
    const response = await api.put(`/support-requests/${requestId}/cancel`, {
      internId,
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi hủy yêu cầu ${requestId}:`, error);
    throw error.response?.data || new Error("Không thể hủy yêu cầu.");
  }
};
