// src/services/taskService.js
import axios from "axios";

// ⚙️ Cấu hình API (sau này đổi baseURL là đủ)
const API_BASE_URL = "http://localhost:8080/api/tasks";

// ✅ Lấy danh sách công việc của thực tập sinh hiện tại
export async function getMyTasks() {
  try {
    const response = await axios.get(`${API_BASE_URL}/my`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách công việc:", error);

    // ⚠️ Tạo mock data fallback (nếu API chưa sẵn sàng)
    return [
      {
        id: 1,
        title: "Hoàn thiện báo cáo tuần 1",
        description: "Viết báo cáo công việc tuần 1 và nộp cho mentor.",
        status: "DONE",
        deadline: "2025-11-02",
      },
      {
        id: 2,
        title: "Học React căn bản",
        description: "Học useState, useEffect và props.",
        status: "IN_PROGRESS",
        deadline: "2025-11-05",
      },
      {
        id: 3,
        title: "Cập nhật nhật ký thực tập",
        description: "Điền thông tin ngày làm việc vào hệ thống.",
        status: "PENDING",
        deadline: "2025-11-10",
      },
    ];
  }
}

// ✅ Cập nhật trạng thái công việc
export async function updateTaskStatus(taskId, newStatus) {
  try {
    const response = await axios.put(`${API_BASE_URL}/${taskId}/status`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái công việc:", error);
    throw error;
  }
}
