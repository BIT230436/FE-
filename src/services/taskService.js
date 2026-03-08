// src/services/taskService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

// ✅ Helper function để lấy userId từ store (Zustand)
const getUserId = () => {
  const { user } = useAuthStore.getState();
  if (user?.id) return user.id;
  return null;
};

// ✅ Lấy danh sách công việc theo internId
export async function getTasksByInternId(internId) {
  try {
    const response = await api.get(`/tasks/intern/${internId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách công việc:", error);
    throw error;
  }
}

// ✅ Cập nhật trạng thái công việc
export async function updateTaskStatus(taskId, newStatus) {
  try {
    const response = await api.put(`/tasks/${taskId}/status`, null, {
      params: { status: newStatus },
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
    const mentorUserId = getUserId();

    if (!mentorUserId) {
      throw new Error("Không tìm thấy thông tin mentor");
    }

    console.log("Getting assigned tasks for mentor userId:", mentorUserId);
    const response = await api.get(`/tasks/assigned`, {
      params: { mentorUserId },
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Lỗi khi tải danh sách nhiệm vụ đã giao:", error);
    throw error;
  }
}

// 🎯 Giao nhiệm vụ mới
export async function assignTask(taskData) {
  try {
    const mentorUserId = getUserId();

    if (!mentorUserId) {
      throw new Error("Không tìm thấy thông tin mentor");
    }

    // ✅ FIX: Đổi từ taskData.deadline sang taskData.due_date
    let dueDateFormatted = null;
    if (taskData.due_date) {
      // Frontend gửi: "2025-10-31T14:30" hoặc "31/10/2025 14:30"
      // Backend cần: "2025-10-31" (chỉ ngày, không có giờ)
      const dateStr = taskData.due_date;

      // Nếu có format "YYYY-MM-DDTHH:mm"
      if (dateStr.includes('T')) {
        dueDateFormatted = dateStr.split('T')[0]; // Lấy phần YYYY-MM-DD
      }
      // Nếu có format "DD/MM/YYYY HH:mm"
      else if (dateStr.includes('/')) {
        const parts = dateStr.split(' ')[0].split('/'); // Lấy phần ngày
        dueDateFormatted = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      // Nếu đã đúng format YYYY-MM-DD
      else {
        dueDateFormatted = dateStr;
      }
    }

    // ✅ Map field names: due_date -> dueDate
    const dataWithMentor = {
      internId: taskData.internId,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || "MEDIUM",
      dueDate: dueDateFormatted, // ✅ Đổi tên field
      assignedBy: mentorUserId
    };


    const response = await api.post(`/tasks/assign`, dataWithMentor);

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Giao nhiệm vụ thất bại");
    }
  } catch (error) {
    console.error("Lỗi khi giao nhiệm vụ:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
    }
    throw error;
  }
}

// 🎯 Cập nhật nhiệm vụ
export async function updateTask(taskId, taskData) {
  try {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật nhiệm vụ:", error);
    throw error;
  }
}

// 🎯 Xóa nhiệm vụ
export async function deleteTask(taskId) {
  try {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa nhiệm vụ:", error);
    throw error;
  }
}