import api from "./apiClient";

// Lấy profile của user hiện tại
export async function getMyProfile(user) {
  // Nếu backend có endpoint /profile/me
  // const response = await api.get("/profile/me");
  // return response.data;

  // Tạm thời mock data dựa trên user từ auth
  // TODO: Thay bằng API call thật khi backend có endpoint
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockProfile = {
        ...user,
        university: user.role === "INTERN" || user.role === "USER" ? "Đại học Bách Khoa Hà Nội" : undefined,
        major: user.role === "INTERN" || user.role === "USER" ? "Công nghệ thông tin" : undefined,
        mentorName: user.role === "INTERN" ? "Nguyễn Văn Mentor" : undefined,
        startDate: user.role === "INTERN" ? "2024-01-15" : undefined,
        endDate: user.role === "INTERN" ? "2024-06-15" : undefined,
        department: user.role === "HR" || user.role === "ADMIN" ? "IT Department" : undefined,
        position: user.role === "HR" ? "HR Manager" : user.role === "ADMIN" ? "System Admin" : undefined,
        joinDate: user.role === "HR" || user.role === "ADMIN" ? "2020-01-01" : undefined,
        permissions: user.role === "ADMIN" ? "Full Access" : undefined,
        status: user.role === "USER" ? "PENDING" : "ACTIVE",
        appliedDate: user.role === "USER" ? new Date().toISOString().split('T')[0] : undefined,
        expectedStartDate: user.role === "USER" ? "2024-09-01" : undefined,
      };
      resolve(mockProfile);
    }, 500);
  });
}

// Cập nhật profile
export async function updateMyProfile(data) {
  const response = await api.put("/profile/me", data);
  return response.data;
}