import api from "./apiClient";
import { useAuthStore } from "../store/authStore";
import dayjs from "dayjs";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Vui lòng đăng nhập lại!");
  return user.id;
}

// Helper function để xử lý lỗi thống nhất
function handleError(error, defaultMessage = "Có lỗi xảy ra") {
  console.error("❌ Service Error:", error);

  // Nếu error đã được format bởi interceptor
  if (error.status !== undefined) {
    throw new Error(error.message || defaultMessage);
  }

  // Nếu là lỗi từ axios gốc
  if (error.response) {
    const message =
      error.response.data?.message ||
      error.response.statusText ||
      defaultMessage;
    throw new Error(message);
  }

  // Lỗi khác
  throw new Error(error.message || defaultMessage);
}

// ==================== QR CODE ====================

export async function generateQrCode(code) {
  try {
    const response = await api.get(`/attendance/generate`, {
      params: { code },
    });
    console.log("📸 Generated QR URL:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Không thể tạo QR code");
  }
}

export async function scanQrCode(code, sig) {
  try {
    const userId = getCurrentUserId();
    const response = await api.post(`/attendance/scan`, null, {
      params: { userId, code, sig },
    });
    console.log("🕐 Scan result:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Không thể quét QR code");
  }
}

// ==================== RECORDS ====================

export async function getRecordsByDate(date) {
  try {
    const response = await api.get(`/attendance/records/date`, {
      params: { date },
    });
    console.log("📅 Attendance records by date:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Không thể lấy danh sách chấm công");
  }
}

export async function getMyAttendanceRecords() {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/attendance/records/my`, {
      params: { userId },
    });
    console.log("🧑 My attendance records:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Không thể lấy bản ghi của bạn");
  }
}

export async function getAllAttendanceRecords() {
  try {
    const response = await api.get(`/attendance/records/all`);
    console.log("📋 All attendance records:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Không thể lấy tất cả bản ghi");
  }
}

// ==================== CHECK IN/OUT ====================

export async function checkIn() {
  try {
    const userId = getCurrentUserId();
    const response = await api.post(`/attendance/check-in`, { userId });
    console.log("✅ Check-in thành công:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Check-in thất bại");
  }
}

export async function checkOut() {
  try {
    const userId = getCurrentUserId();
    const response = await api.post(`/attendance/check-out`, { userId });
    console.log("🚪 Check-out thành công:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Check-out thất bại");
  }
}

// ==================== TODAY & HISTORY ====================

export async function getTodayAttendance() {
  try {
    const userId = getCurrentUserId();
    const today = dayjs().format("YYYY-MM-DD");
    const response = await api.get(`/attendance/today`, {
      params: { userId, date: today },
    });
    console.log("📅 Today attendance:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Không thể lấy thông tin hôm nay");
  }
}

export async function getAttendanceHistory({ page = 0, size = 10 }) {
  try {
    const userId = getCurrentUserId();
    const response = await api.get(`/attendance/history`, {
      params: { userId, page, size },
    });
    console.log("📚 Attendance history:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Không thể lấy lịch sử chấm công");
  }
}

// ==================== REPORT ====================

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
    console.log("📊 Attendance report:", response.data);
    return response.data;
  } catch (error) {
    handleError(error, "Không thể lấy báo cáo chuyên cần");
  }
}
