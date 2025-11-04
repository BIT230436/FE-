// src/services/reportService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Vui lòng đăng nhập lại!");
  return user.id;
}

export async function createMentorEvaluation(request) {
  try {
    const userId = getCurrentUserId();
    const payload = { ...request, userId };
    const response = await api.post(`/reports/mentor`, payload);
    console.log("✅ Created Evaluation:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateMentorEvaluation(evaluationId, request) {
  try {
    const userId = getCurrentUserId();
    const payload = { ...request, userId };
    const response = await api.put(`/reports/mentor/${evaluationId}`, payload);
    console.log("📝 Updated Evaluation:", response.data);
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
    console.log("🗑️ Deleted Evaluation:", evaluationId);
  } catch (error) {
    handleError(error);
  }
}

export async function getEvaluationsByIntern(internId) {
  try {
    const response = await api.get(`/reports/intern/${internId}/evaluations`);
    console.log("📄 Fetched Evaluations:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function createReport(request) {
  try {
    const userId = getCurrentUserId();
    const response = await api.post(`/reports?userId=${userId}`, request);
    console.log("✅ Created Report:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function updateReport(reportId, request) {
  try {
    const response = await api.put(`/reports/${reportId}`, request);
    console.log("📝 Updated Report:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function deleteReport(reportId) {
  try {
    await api.delete(`/reports/${reportId}`);
    console.log("🗑️ Deleted Report:", reportId);
  } catch (error) {
    handleError(error);
  }
}

export async function getReportById(reportId) {
  try {
    const response = await api.get(`/reports/${reportId}`);
    console.log("🔍 Fetched Report Detail:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getReportsByIntern(internId) {
  try {
    const response = await api.get(`/reports/intern/${internId}`);
    console.log("📋 Fetched Intern Reports:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// 🔹 Lấy tất cả báo cáo (Report) của user hiện tại
export async function getReportsByUser() {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/reports/by-user/reports`, {
      params: { userId },
    });
    console.log("📋 Fetched Reports by User:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// 🔹 Lấy tất cả đánh giá (Evaluation) của user hiện tại
export async function getEvaluationsByUser() {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/reports/by-user/evaluations`, {
      params: { userId },
    });
    console.log("📄 Fetched Evaluations by User:", response.data);
    return response.data;
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
