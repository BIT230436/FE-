import api from "./apiClient";

/**
 * [HR] Lấy danh sách lịch làm việc
 * @param {Object} params - { page, size, groupId }
 */
export async function getWorkSchedules(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append("page", params.page);
  if (params.size) queryParams.append("size", params.size);
  if (params.groupId) queryParams.append("groupId", params.groupId);

  const { data } = await api.get(`/work-schedules?${queryParams.toString()}`);
  return data;
}

/**
 * [HR] Tạo lịch làm việc mới
 * @param {Object} scheduleData - { applyType, groupId, internId, startTime, endTime, daysPerWeek, workDays, note }
 */
export async function createWorkSchedule(scheduleData) {
  const { data } = await api.post("/work-schedules", scheduleData);
  return data;
}

/**
 * [HR] Cập nhật lịch làm việc
 * @param {number} scheduleId - ID của lịch làm việc
 * @param {Object} scheduleData - Dữ liệu cần cập nhật
 */
export async function updateWorkSchedule(scheduleId, scheduleData) {
  const { data } = await api.put(`/work-schedules/${scheduleId}`, scheduleData);
  return data;
}

/**
 * [HR] Xóa lịch làm việc
 * @param {number} scheduleId - ID của lịch làm việc
 */
export async function deleteWorkSchedule(scheduleId) {
  const { data } = await api.delete(`/work-schedules/${scheduleId}`);
  return data;
}

/**
 * [HR] Lấy chi tiết lịch làm việc
 * @param {number} scheduleId - ID của lịch làm việc
 */
export async function getWorkScheduleById(scheduleId) {
  const { data } = await api.get(`/work-schedules/${scheduleId}`);
  return data;
}

/**
 * [HR] Lấy danh sách nhóm thực tập sinh
 */
export async function getInternGroups() {
  const { data } = await api.get("/intern-groups");
  return data;
}

/**
 * [HR] Lấy danh sách thực tập sinh
 * @param {Object} params - { groupId, status }
 */
export async function getInterns(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.status) queryParams.append("status", params.status);
  // Lấy tất cả intern (không filter theo mentor) để HR chọn
  queryParams.append("size", "1000");

  const { data } = await api.get(`/intern-profiles?${queryParams.toString()}`);
  return data;
}

/**
 * [HR] Lấy thống kê lịch làm việc
 */
export async function getWorkScheduleStats() {
  const { data } = await api.get("/work-schedules/stats");
  return data;
}
