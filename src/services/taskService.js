// src/services/taskService.js
import axios from "axios";

// ⚙️ Cấu hình API (sau này đổi baseURL là đủ)
const API_BASE_URL = "http://localhost:8090/api/tasks";

// Get authorization token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Lấy danh sách công việc của thực tập sinh hiện tại
export async function getMyTasks() {
  try {
    const response = await api.get("/my");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách công việc:", error);
    throw error;
  }
}

// ✅ Cập nhật trạng thái công việc
export async function updateTaskStatus(taskId, newStatus) {
  try {
    const response = await api.patch(`/${taskId}/status`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    throw error;
  }
}

// 🎯 Lấy danh sách nhiệm vụ đã giao (cho mentor)
export async function getAssignedTasks() {
  try {
    const response = await api.get("/assigned");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách nhiệm vụ đã giao:", error);
    throw error;
  }
}

// 🎯 Giao nhiệm vụ mới
export async function assignTask(taskData) {
  try {
    const response = await api.post("", taskData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi giao nhiệm vụ:", error);
    throw error;
  }
}

// 🎯 Cập nhật nhiệm vụ
export async function updateTask(taskId, taskData) {
  try {
    const response = await api.put(`/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật nhiệm vụ:", error);
    throw error;
  }
}

// 🎯 Xóa nhiệm vụ
export async function deleteTask(taskId) {
  try {
    const response = await api.delete(`/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa nhiệm vụ:", error);
    throw error;
  }
}
