import api from "./apiClient";

// Lấy profile của user hiện tại
export async function getMyProfile(user) {
  try {
    const response = await api.get("/profile/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    // Fallback: trả về thông tin cơ bản từ user nếu API lỗi
    return {
      ...user,
      university: null,
      major: null,
      mentorName: null,
      startDate: null,
      endDate: null,
      department: null,
      position: null,
      joinDate: null,
      permissions: null,
    };
  }
}

// Cập nhật profile
export async function updateMyProfile(data) {
  const response = await api.put("/profile/me", data);
  return response.data;
}