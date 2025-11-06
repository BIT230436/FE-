import api from "./apiClient";
import { useAuthStore } from "../store/authStore";

function getCurrentUserId() {
  const { user } = useAuthStore.getState();
  if (!user || !user.id)
    throw new Error("Không tìm thấy user. Vui lòng đăng nhập lại!");
  return user.id;
}

// ✅ Thêm GPS mới
export async function addGps(request) {
  try {
    const userId = getCurrentUserId();
    const payload = { ...request, userId };
    const response = await api.post(`/gps`, payload);
    console.log("✅ Added GPS:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// 📝 Cập nhật GPS
export async function updateGps(request) {
  try {
    const userId = getCurrentUserId();
    const payload = { ...request, userId };
    const response = await api.put(`/gps`, payload);
    console.log("📝 Updated GPS:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// 🔄 Kích hoạt GPS (active)
export async function activateGps(gpsId) {
  try {
    const userId = getCurrentUserId();
    const response = await api.put(`/gps/activate/${userId}/${gpsId}`);
    console.log("🚀 Activated GPS:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// 🗑️ Xóa GPS
export async function deleteGps(gpsId) {
  try {
    const userId = getCurrentUserId();
    await api.delete(`/gps/${userId}/${gpsId}`);
    console.log("🗑️ Deleted GPS:", gpsId);
  } catch (error) {
    handleError(error);
  }
}

// 📍 Lấy danh sách tất cả GPS
export async function getAllGps() {
  try {
    const response = await api.get(`/gps`);
    console.log("📍 All GPS:", response.data);
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  if (error.response) {
    console.error("❌ Server error:", error.response.data);
    throw new Error(error.response.data.message || "Lỗi từ server");
  } else if (error.request) {
    console.error("⚠️ Không nhận được phản hồi từ server:", error.request);
    throw new Error("Không kết nối được tới server");
  } else {
    console.error("🚨 Lỗi khác:", error.message);
    throw new Error(error.message);
  }
}
