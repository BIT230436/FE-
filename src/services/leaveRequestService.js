import api from "./apiClient";

/**
 * Lấy danh sách yêu cầu nghỉ phép của intern hiện tại
 * @param {string} email - Email của user (hoặc userId)
 */
export async function getLeaveRequests(email) {
  const { data } = await api.get(`/leave-requests?email=${email}`);
  return data;
}

/**
 * Tạo yêu cầu nghỉ phép mới
 * @param {Object} requestData - { email, startDate, endDate, reason }
 */
export async function createLeaveRequest(requestData) {
  const { data } = await api.post("/leave-requests", requestData);
  return data;
}

/**
 * Hủy yêu cầu nghỉ phép (chỉ khi đang ở trạng thái pending)
 * @param {number} requestId - ID của yêu cầu nghỉ phép
 */
export async function cancelLeaveRequest(requestId) {
  const { data } = await api.delete(`/leave-requests/${requestId}`);
  return data;
}

/**
 * Lấy chi tiết một yêu cầu nghỉ phép
 * @param {number} requestId - ID của yêu cầu nghỉ phép
 */
export async function getLeaveRequestById(requestId) {
  const { data } = await api.get(`/leave-requests/${requestId}`);
  return data;
}

/**
 * Lấy thống kê nghỉ phép
 */
export async function getLeaveStats() {
  const { data } = await api.get("/leave-requests/stats");
  return data;
}