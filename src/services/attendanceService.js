import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Vui lòng đăng nhập lại!");
  return user.id;
}

export async function generateQrCode(code) {
  try {
    const response = await api.get(`/attendance/generate`, {
      params: { code },
    });
    console.log("📸 Generated QR URL:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function scanQrCode(code, sig) {
  try {
    const userId = getCurrentUserId();
    const response = await api.post(`/attendance/scan`, null, {
      params: { userId, code, sig },
    });
    console.log("🕒 Scan result:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getRecordsByDate(date) {
  try {
    const response = await api.get(`/attendance/records/date`, {
      params: { date },
    });
    console.log("📅 Attendance records by date:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function getMyAttendanceRecords() {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/attendance/records/my`, {
      params: { userId },
    });
    console.log("🧍 My attendance records:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// ✅ 5️⃣ Lấy tất cả bản ghi chấm công (HR)
export async function getAllAttendanceRecords() {
  try {
    const response = await api.get(`/attendance/records/all`);
    console.log("📋 All attendance records:", response.data);
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
