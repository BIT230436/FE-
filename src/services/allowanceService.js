import api from "./apiClient";


const API_URL = "/allowances";

/**
 * Lấy danh sách tất cả phụ cấp
 * @param {object} params - Query parameters (internId, startDate, endDate, page, size)
 * @returns {Promise<Array>}
 */
export const getAllowances = (params = {}) => {
  return api.get(API_URL, { params }).then(response => {
    console.log("getAllowances response:", response.data);
    // Backend trả về { success: true, data: [...], pagination: {...} }
    return response.data.data || [];
  }).catch(error => {
    console.error("getAllowances error:", error.response?.data);
    throw error;
  });
};

/**
 * Lấy chi tiết một phụ cấp
 * @param {number} id - ID phụ cấp
 * @returns {Promise<object>}
 */
export const getAllowanceById = (id) => {
  return api.get(`${API_URL}/${id}`).then(response => {
    return response.data.data;
  });
};

/**
 * Tạo một khoản phụ cấp mới
 * @param {object} allowanceData - Dữ liệu phụ cấp
 * @param {number} allowanceData.internId - ID của thực tập sinh
 * @param {string} allowanceData.allowanceType - Loại phụ cấp (Backend field name)
 * @param {number} allowanceData.amount - Số tiền
 * @param {string} allowanceData.date - Ngày áp dụng (YYYY-MM-DD) (Backend field name)
 * @param {string} allowanceData.note - Ghi chú (optional)
 * @returns {Promise<object>}
 */
export const createAllowance = (allowanceData) => {
  console.log("Creating allowance:", allowanceData);
  return api.post(API_URL, allowanceData).then(response => {
    console.log("Create response:", response.data);
    return response.data;
  }).catch(error => {
    console.error("Create error:", error.response?.data);
    throw error;
  });
};

/**
 * Cập nhật phụ cấp
 * @param {number} id - ID phụ cấp
 * @param {object} allowanceData - Dữ liệu cập nhật
 * @returns {Promise<object>}
 */
export const updateAllowance = (id, allowanceData) => {
  return api.put(`${API_URL}/${id}`, allowanceData).then(response => {
    return response.data;
  });
};

/**
 * Xóa phụ cấp
 * @param {number} id - ID phụ cấp
 * @returns {Promise<object>}
 */
export const deleteAllowance = (id) => {
  return api.delete(`${API_URL}/${id}`).then(response => {
    return response.data;
  });
};

/**
 * Duyệt/thanh toán phụ cấp
 * @param {number} id - ID phụ cấp
 * @returns {Promise<object>}
 */
export const approveAllowance = (id) => {
  return api.put(`${API_URL}/${id}/approve`).then(response => {
    return response.data;
  });
};

/**
 * Lấy thống kê phụ cấp theo intern
 * @param {number} internId - ID thực tập sinh
 * @returns {Promise<object>}
 */
export const getAllowanceStatsByIntern = (internId) => {
  return api.get(`${API_URL}/stats/by-intern/${internId}`).then(response => {
    return response.data.data;
  });
};

/**
 * Lấy danh sách phụ cấp chờ duyệt
 * @param {number} page - Trang hiện tại
 * @param {number} size - Số lượng/trang
 * @returns {Promise<object>}
 */
export const getPendingAllowances = (page = 0, size = 20) => {
  return api.get(`${API_URL}/pending`, {
    params: { page, size }
  }).then(response => {
    return response.data;
  });
};

/**
 * Lấy danh sách phụ cấp đã duyệt
 * @param {number} page - Trang hiện tại
 * @param {number} size - Số lượng/trang
 * @returns {Promise<object>}
 */
export const getApprovedAllowances = (page = 0, size = 20) => {
  return api.get(`${API_URL}/approved`, {
    params: { page, size }
  }).then(response => {
    return response.data;
  });
};

/**
 * Lấy dashboard thống kê
 * @returns {Promise<object>}
 */
export const getAllowanceDashboard = () => {
  return api.get(`${API_URL}/dashboard`).then(response => {
    return response.data.data;
  });
};

/**
 * Duyệt nhiều phụ cấp cùng lúc
 * @param {Array<number>} allowanceIds - Danh sách ID phụ cấp
 * @returns {Promise<object>}
 */
export const approveMultiple = (allowanceIds) => {
  return api.post(`${API_URL}/approve-multiple`, {
    allowanceIds
  }).then(response => {
    return response.data;
  });
};

/**
 * Xuất báo cáo phụ cấp theo tháng
 * @param {string} month - Tháng (YYYY-MM)
 * @returns {Promise<object>}
 */
export const getMonthlyReport = (month) => {
  return api.get(`${API_URL}/report/monthly`, {
    params: { month }
  }).then(response => {
    return response.data;
  });
};

/**
 * Lấy lịch sử phụ cấp của thực tập sinh hiện tại
 * @returns {Promise<object>}
 */
export const getMyAllowanceHistory = () => {
  return api.get(`${API_URL}/my-history`).then(response => {
    return response.data;
  });
};
