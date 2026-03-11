// src/services/supportRequestService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// ⭐ Lấy user_id trực tiếp từ user object
function getCurrentUserId() {
  const { user } = useAuthStore.getState();

  console.log("=== DEBUG USER ===");
  console.log("Full user object:", user);
  console.log("user.id:", user?.id);
  console.log("user.role:", user?.role);
  console.log("==================");

  if (!user) {
    throw new Error("Người dùng chưa đăng nhập. Vui lòng đăng nhập lại!");
  }

  const allowedRoles = ["INTERN", "USER"];
  if (!allowedRoles.includes(user.role?.toUpperCase())) {
    throw new Error("Chỉ thực tập sinh mới có thể thực hiện thao tác này!");
  }

  const userId = user.id;

  if (!userId) {
    console.error("Cannot find userId. User object:", JSON.stringify(user, null, 2));
    throw new Error("Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!");
  }

  console.log("✅ Using user_id:", userId);
  return userId;
}

function getCurrentHrId() {
  const { user } = useAuthStore.getState();
  if (!user || (user.role !== "HR" && user.role !== "ADMIN") || !user.id) {
    console.warn("User might not be HR/ADMIN or ID is missing for HR operation.");
    return user?.id;
  }
  return user.id;
}

/**
 * Lấy danh sách yêu cầu hỗ trợ của thực tập sinh hiện tại
 */
export const getMySupportRequests = async (filters = {}) => {
  try {
    const userId = getCurrentUserId();
    console.log("📋 Fetching requests for user_id:", userId);

    const params = { ...filters };
    // ⭐ Dùng endpoint /user/{userId}
    const response = await api.get(`/support-requests/user/${userId}`, {
      params,
    });

    console.log("API Response:", response.data);
    return response.data?.data || [];
  } catch (error) {
    console.error("Lỗi khi tải danh sách yêu cầu:", error);
    throw error.response?.data || error;
  }
};

/**
 * Tạo yêu cầu hỗ trợ mới
 */
export const createSupportRequest = async ({
  type,
  description,
  priority = "NORMAL", // ⭐ Priority với giá trị mặc định
  attachment,
}) => {
  try {
    const userId = getCurrentUserId();
    console.log("📝 Creating request with user_id:", userId);
    console.log("Type:", type);
    console.log("Description:", description);
    console.log("Priority:", priority); // ⭐ Log priority
    console.log("Attachment:", attachment);

    if (!userId) {
      throw new Error("Không có userId");
    }
    if (!type || type.trim() === "") {
      throw new Error("Loại yêu cầu không được để trống");
    }
    if (!description || description.trim() === "") {
      throw new Error("Mô tả không được để trống");
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("subject", type);
    formData.append("message", description);
    formData.append("priority", priority); // ⭐ Gửi priority thay vì hard-code "NORMAL"

    if (attachment) {
      formData.append("file", attachment);
    }

    console.log("📤 FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    const response = await api.post("/support-requests/upload", formData);

    console.log("✅ Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo yêu cầu:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    throw error.response?.data || error;
  }
};

// Các hàm khác giữ nguyên...
export const getAllSupportRequests = async (filters = {}) => {
  try {
    const response = await api.get("/support-requests", { params: filters });
    const data = response.data?.data;

    if (data?.content && Array.isArray(data.content)) {
      return {
        content: data.content,
        currentPage: data.currentPage || 0,
        totalPages: data.totalPages || 0,
        totalItems: data.totalItems || 0,
      };
    }

    if (Array.isArray(data)) {
      return {
        content: data,
        currentPage: 0,
        totalPages: 1,
        totalItems: data.length,
      };
    }

    return {
      content: [],
      currentPage: 0,
      totalPages: 0,
      totalItems: 0,
    };
  } catch (error) {
    console.error("Lỗi khi tải tất cả yêu cầu:", error);
    throw error.response?.data || error;
  }
};

export const getSupportRequestsByStatus = async (status) => {
  try {
    const response = await api.get(`/support-requests/status/${status}`);
    return response.data?.data || [];
  } catch (error) {
    console.error(`Lỗi khi tải yêu cầu theo status ${status}:`, error);
    throw error.response?.data || error;
  }
};

export const reviewSupportRequest = async (requestId, { status, response }) => {
  try {
    const hrId = getCurrentHrId();
    if (!hrId) {
      throw new Error("Không tìm thấy thông tin HR. Vui lòng đăng nhập lại.");
    }

    const payload = {
      status,
      response: response || "",
    };

    const apiResponse = await api.put(
      `/support-requests/${requestId}/process?hrId=${hrId}`,
      payload
    );

    return apiResponse.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật yêu cầu ${requestId}:`, error);
    throw error.response?.data || error;
  }
};

export const getSupportRequestById = async (requestId) => {
  try {
    const response = await api.get(`/support-requests/${requestId}`);
    return response.data?.data;
  } catch (error) {
    console.error(`Lỗi khi tải chi tiết yêu cầu ${requestId}:`, error);
    throw error.response?.data || error;
  }
};

export const cancelSupportRequest = async (requestId) => {
  try {
    const userId = getCurrentUserId();
    const response = await api.put(`/support-requests/${requestId}/cancel`, {
      userId,
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi hủy yêu cầu ${requestId}:`, error);
    throw error.response?.data || error;
  }
};