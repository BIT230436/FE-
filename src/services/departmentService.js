import api from "./apiClient";

export const getDepartmentsByProgram = async (programId) => {

    
  try {
    const response = await api.get(`/departments/program/${programId}`);
    const rows = response.data || [];

    return rows.map((d) => ({
      id: d.id,
      departmentName: d.nameDepartment,

        description: d.description || "", 

        capacity: d.capacity, 
      programId: d.programId,
    }));
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách department:", error);
    throw error;
  }
};

export const createDepartment = async (programId, departmentData) => {
  try {
    const payload = {
      departmentName: departmentData.departmentName,
      description: departmentData.description,
    };

    const response = await api.post(
      `/departments/program/${programId}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo department:", error);
    throw error;
  }
};

export const createDepartmentsBatch = async (programId, departments) => {
  try {
    const payload = departments.map((d) => ({
      departmentName: d.departmentName,
      description: d.description,
    }));

    const response = await api.post(
      `/departments/program/${programId}/batch`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo nhiều department:", error);
    throw error;
  }
};

export const getAllDepartments = async () => {
  try {
    const response = await api.get("/departments");
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy tất cả department:", error);
    throw error;
  }
};

export const updateDepartment = async (id, departmentData) => {
  try {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật department:", error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi xóa department:", error);
    throw error;
  }
};
