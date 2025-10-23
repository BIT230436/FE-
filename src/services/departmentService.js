// src/services/departmentService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Hãy đăng nhập lại!");
  return user.id;
}

// ✅ Lấy danh sách department theo program
export const getDepartmentsByProgram = async (programId) => {
  try {
    const response = await api.get(`/departments/program/${programId}`);
    const rows = response.data || [];

    return rows.map((d) => ({
      id: d.id,
      departmentName: d.nameDepartment, // ✅ BE field: nameDepartment
      capacity: d.capacity,
      programId: d.programId,
      hrName: d.hrName || "Không rõ", // ✅ BE field: hrName
    }));
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

// ✅ Tạo 1 department
export const createDepartment = async (programId, departmentData) => {
  const userId = getCurrentUserId();

  console.log("=== DEBUG SERVICE CREATE ===");
  console.log("User ID:", userId);
  console.log("Program ID:", programId);
  console.log(
    "Request URL:",
    `/departments/program/${programId}/user/${userId}`
  );
  console.log("Request Body:", departmentData);
  console.log("============================");

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
