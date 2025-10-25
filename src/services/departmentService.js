// src/services/departmentService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Hãy đăng nhập lại!");
  return user.id;
}

// ✅ Lấy danh sách department theo 1 chương trình (programId)
export const getDepartmentsByProgram = async (programId) => {
  try {
    const response = await api.get(`/departments/program/${programId}`);
    const rows = response.data || [];

    return rows.map((d) => ({
      id: d.id,
      departmentName: d.nameDepartment, // field trong BE
      capacity: d.capacity,
      programId: d.programId,
      hrName: d.hrName || "Không rõ",
    }));
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

// ✅ Tạo 1 department mới
export const createDepartment = async (programId, departmentData) => {
  const userId = getCurrentUserId();
  const response = await api.post(
    `/departments/program/${programId}/user/${userId}`,
    departmentData
  );
  return response.data;
};

// ✅ Cập nhật department
export const updateDepartment = async (id, departmentData) => {
  const response = await api.put(`/departments/${id}`, departmentData);
  return response.data;
};

// ✅ Xoá department
export const deleteDepartment = async (id) => {
  const response = await api.delete(`/departments/${id}`);
  return response.data;
};

// ✅ Xóa mentor khỏi department
export const removeMentorFromDepartment = async (mentorId) => {
  try {
    const response = await api.delete(`/departments/mentors/${mentorId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing mentor from department:", error);
    throw error;
  }
};

// ✅ Lấy danh sách mentor trong 1 department
export const getMentorsByDepartment = async (departmentId) => {
  try {
    const response = await api.get(`/departments/${departmentId}/mentors`);
    const mentors = response.data || [];
    
    
    return mentors.map(m => ({
      id: m.mentorId,          
      name: m.mentorName,       
      fullName: m.mentorName,    
      departmentId: m.departmentId,
      departmentName: m.departmentName
    }));
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return [];
  }
};

// ✅ Thêm mentor vào department
export const addMentorToDepartment = async (departmentId, mentorId) => {
  try {
    const response = await api.post(
      `/departments/${departmentId}/mentors/${mentorId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error adding mentor to department:", error);
    throw error;
  }
};

// ✅ Cập nhật mentor sang department khác
export const updateMentorDepartment = async (mentorId, newDepartmentId) => {
  try {
    const response = await api.put(
      `/departments/mentors/${mentorId}/department/${newDepartmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error updating mentor department:", error);
    throw error;
  }
};
