// src/services/scheduleService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8090/api/tasks";

// ✅ Lấy lịch thực tập từ tasks
export async function getMySchedule(userId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/my-schedule?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải lịch thực tập:", error);
    throw error;
  }
}