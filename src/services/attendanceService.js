import api from "./apiClient";

/**
 * Check-in - Ghi nhận giờ vào làm
 */
export async function checkIn() {
  const { data } = await api.post("/attendance/check-in");
  return data;
}

/**
 * Check-out - Ghi nhận giờ ra về
 */
export async function checkOut() {
  const { data } = await api.post("/attendance/check-out");
  return data;
}

/**
 * Lấy thông tin chấm công hôm nay
 */
export async function getTodayAttendance() {
  const { data } = await api.get("/attendance/today");
  return data;
}

/**
 * Lấy lịch sử chấm công
 * @param {Object} params - { page, size, startDate, endDate }
 */
export async function getAttendanceHistory(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append("page", params.page);
  if (params.size) queryParams.append("size", params.size);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);

  const { data } = await api.get(
    `/attendance/history?${queryParams.toString()}`
  );
  return data;
}

/**
 * Lấy thống kê chấm công
 * @param {Object} params - { startDate, endDate }
 */
export async function getAttendanceStats(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);

  const { data } = await api.get(`/attendance/stats?${queryParams.toString()}`);
  return data;
}
