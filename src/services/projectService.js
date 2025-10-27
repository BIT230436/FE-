// src/services/projectService.js
import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Hãy đăng nhập lại!");
  return user.id;
}

// ✅ Lấy tất cả project
export const getAllProjects = async () => {
  const res = await api.get(`/projects`);
  return res.data;
};

// ✅ Lấy project theo mentor hiện tại
export const getProjectsByCurrentMentor = async () => {
  const userId = getCurrentUserId();
  const res = await api.get(`/projects/mentor/${userId}`);
  return res.data;
};

// ✅ Tạo project
export const createProject = async (projectData) => {
  const userId = getCurrentUserId();
  const res = await api.post(`/projects/${userId}`, projectData);
  return res.data;
};

// ✅ Cập nhật project
export const updateProject = async (projectId, projectData) => {
  const userId = getCurrentUserId();
  const res = await api.put(`/projects/${projectId}/${userId}`, projectData);
  return res.data;
};

// ✅ Xóa project
export const deleteProject = async (projectId) => {
  const userId = getCurrentUserId();
  const res = await api.delete(`/projects/${projectId}/${userId}`);
  return res.data;
};

// ✅ Thêm intern vào project
export const addInternToProject = async (projectId, internId) => {
  const userId = getCurrentUserId();
  const res = await api.post(
    `/projects/${projectId}/add-intern/${userId}/${internId}`
  );
  return res.data;
};



// ✅ HR chuyển intern sang project khác
export const transferInternToAnotherProject = async (internId, newProjectId) => {
  const userId = getCurrentUserId();
  const res = await api.put(
    `/projects/transfer-intern`,
    null, // body rỗng, vì BE dùng @RequestParam
    {
      params: { internId, newProjectId, userId },
    }
  );
  return res.data;
};

// ✅ HR xóa intern khỏi project
export const removeInternFromProject = async (internId) => {
  const userId = getCurrentUserId();
  const res = await api.put(
    `/projects/remove-intern`,
    null,
    {
      params: { internId, userId },
    }
  );
  return res.data;
};