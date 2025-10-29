// src/services/reportService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// 🔹 Hàm tiện ích lấy userId hiện tại
function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Hãy đăng nhập lại!");
  return user.id;
}

export async function createMentorEvaluation(request) {
  try {
    const userId = getCurrentUserId();
    const payload = { ...request, userId };
    const response = await api.post(`/reports/mentor`, payload);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateMentorEvaluation(evaluationId, request) {
  try {
    const userId = getCurrentUserId();
    const payload = { ...request, userId }; // thêm userId vào body
    const response = await api.put(`/reports/mentor/${evaluationId}`, payload);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteMentorEvaluation(evaluationId) {
  try {
    const userId = getCurrentUserId();
    await api.delete(`/reports/mentor/${evaluationId}`, {
      params: { userId },
    });
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  if (error.response) {
    console.error("❌ Server error:", error.response.data);
    throw new Error(error.response.data.message || "Lỗi từ server");
  } else if (error.request) {
    console.error("⚠️ Không nhận được phản hồi từ server:", error.request);
    throw new Error("Không kết nối được tới server");
  } else {
    console.error("🚨 Lỗi khác:", error.message);
    throw new Error(error.message);
  }
}
