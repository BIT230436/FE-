import api from "./apiClient";

/**
 * Lấy danh sách yêu cầu nghỉ phép của thực tập sinh
 * @param {Object} params - { page, size, status, startDate, endDate }
 */
export async function getLeaveRequests(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append("page", params.page);
  if (params.size) queryParams.append("size", params.size);
  if (params.status) queryParams.append("status", params.status);
  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);

  const { data } = await api.get(`/leave-requests?${queryParams.toString()}`);
  return data;
}

/**
 * Tạo yêu cầu nghỉ phép mới
 * @param {Object} requestData - { leaveType, startDate, endDate, reason }
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
 * Lấy thống kê nghỉ phép của thực tập sinh
 */
export async function getLeaveStats() {
  const { data } = await api.get("/leave-requests/stats");
  return data;
}

/**
 * Cập nhật yêu cầu nghỉ phép (nếu cho phép)
 * @param {number} requestId - ID của yêu cầu nghỉ phép
 * @param {Object} requestData - Dữ liệu cần cập nhật
 */
export async function updateLeaveRequest(requestId, requestData) {
  const { data } = await api.put(`/leave-requests/${requestId}`, requestData);
  return data;
}
