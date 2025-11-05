import api from "./apiClient";
import { useAuthStore } from "../store/authStore";
import dayjs from "dayjs";

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

// Chấm công vào làm
export async function checkIn() {
  try {
    const userId = getCurrentUserId();
    const response = await api.post(`/attendance/check-in`, { userId });
    console.log("✅ Check-in thành công:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// Chấm công tan làm
export async function checkOut() {
  try {
    const userId = getCurrentUserId();
    const response = await api.post(`/attendance/check-out`, { userId });
    console.log("🚪 Check-out thành công:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// Lấy thông tin chấm công hôm nay
export async function getTodayAttendance() {
  try {
    const userId = getCurrentUserId();
    const today = dayjs().format("YYYY-MM-DD");
    const response = await api.get(`/attendance/today`, {
      params: { userId, date: today },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// Lấy báo cáo chuyên cần
export async function getAttendanceReport(filters) {
  try {
    const { dateRange, group, mentor, searchText } = filters;
    const params = {};

    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dayjs(dateRange[0]).format("YYYY-MM-DD");
      params.endDate = dayjs(dateRange[1]).format("YYYY-MM-DD");
    }

    if (group) params.department = group;
    if (mentor) params.mentorId = mentor;
    if (searchText) params.search = searchText;

    const response = await api.get(`/attendance/report`, { params });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy báo cáo chuyên cần:", error);
    throw error;
  }
}

// Lấy lịch sử chấm công
export async function getAttendanceHistory(startDate, endDate) {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/attendance/history`, {
      params: {
        userId,
        startDate: dayjs(startDate).format("YYYY-MM-DD"),
        endDate: dayjs(endDate).format("YYYY-MM-DD"),
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  if (error.response) {
    console.error("❌ Lỗi từ server:", error.response.data);
    throw new Error(error.response.data.message || "Lỗi từ server");
  } else if (error.request) {
    console.error("⚠️ Không nhận được phản hồi từ server:", error.request);
    throw new Error("Không kết nối được tới server");
  } else {
    console.error("🚨 Lỗi khác:", error.message);
    throw new Error(error.message);
  }
}
