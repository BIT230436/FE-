import api from "./apiClient";

const API_URL = "/allowances";

/**
 * Lấy danh sách tất cả phụ cấp
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const getAllowances = () => {
  return api.get(API_URL);
};

/**
 * Tạo một khoản phụ cấp mới
 * @param {object} allowanceData - Dữ liệu phụ cấp
 * @param {string} allowanceData.internId - ID của thực tập sinh
 * @param {string} allowanceData.allowanceType - Loại phụ cấp
 * @param {number} allowanceData.amount - Số tiền
 * @param {string} allowanceData.applyDate - Ngày áp dụng (YYYY-MM-DD)
 * @returns {Promise<axios.AxiosResponse<any>>}
 */
export const createAllowance = (allowanceData) => {
  return api.post(API_URL, allowanceData);
};
