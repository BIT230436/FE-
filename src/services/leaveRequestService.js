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

// ==================== HR APIs ====================

/**
 * [HR] Lấy tất cả yêu cầu nghỉ phép (của tất cả thực tập sinh)
 * @param {Object} params - { page, size, status, internName }
 */
export async function getAllLeaveRequests(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append("page", params.page);
  if (params.size) queryParams.append("size", params.size);
  if (params.status) queryParams.append("status", params.status);
  if (params.internName) queryParams.append("internName", params.internName);

  const { data } = await api.get(`/leave-requests?${queryParams.toString()}`);
  return data;
}

/**
 * [HR] Lấy danh sách đơn chờ duyệt
 */
export async function getPendingLeaveRequests() {
  const { data } = await api.get("/leave-requests/pending");
  return data;
}

/**
 * [HR] Duyệt yêu cầu nghỉ phép
 * @param {number} requestId - ID của yêu cầu nghỉ phép
 * @param {Object} data - { hrEmail } hoặc lấy từ localStorage
 */
export async function approveLeaveRequest(requestId, data = {}) {
  // Lấy email HR từ nhiều nguồn
  let hrEmail = data.hrEmail || localStorage.getItem('userEmail');

  // Nếu không có, thử parse từ auth-storage (Zustand)
  if (!hrEmail) {
    const authStorageStr = localStorage.getItem('auth-storage');
    if (authStorageStr) {
      try {
        const authStorage = JSON.parse(authStorageStr);
        hrEmail = authStorage.state?.user?.email;
      } catch (e) {
        console.error('Parse auth-storage failed:', e);
      }
    }
  }

  if (!hrEmail) {
    throw new Error('Không tìm thấy thông tin HR. Vui lòng đăng nhập lại.');
  }

  const response = await api.put(
    `/leave-requests/${requestId}/approve`,
    { hrEmail: hrEmail }
  );
  return response.data;
}

/**
 * [HR] Từ chối yêu cầu nghỉ phép
 * @param {number} requestId - ID của yêu cầu nghỉ phép
 * @param {Object} data - { note, hrEmail } - note là lý do từ chối (bắt buộc)
 */
export async function rejectLeaveRequest(requestId, data) {
  // Lấy email HR từ nhiều nguồn
  let hrEmail = data.hrEmail || localStorage.getItem('userEmail');

  // Nếu không có, thử parse từ auth-storage (Zustand)
  if (!hrEmail) {
    const authStorageStr = localStorage.getItem('auth-storage');
    if (authStorageStr) {
      try {
        const authStorage = JSON.parse(authStorageStr);
        hrEmail = authStorage.state?.user?.email;
      } catch (e) {
        console.error('Parse auth-storage failed:', e);
      }
    }
  }

  if (!hrEmail) {
    throw new Error('Không tìm thấy thông tin HR. Vui lòng đăng nhập lại.');
  }

  const payload = {
    hrEmail: hrEmail,
    rejectionReason: data.note || data.rejectionReason,
  };

  const response = await api.put(
    `/leave-requests/${requestId}/reject`,
    payload
  );
  return response.data;
}

/**
 * [HR] Lấy thống kê nghỉ phép
 */
export async function getLeaveRequestStats() {
  const { data } = await api.get("/leave-requests/stats");
  return data;
}