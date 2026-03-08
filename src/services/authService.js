import api from "./apiClient";

// Đăng nhập - API thật
export async function login(data) {
  const response = await api.post("/auth/login", {
    email: data.email,
    password: data.password,
  });
  return response.data;
}

// Đăng ký - API thật
export async function register(data) {
  const response = await api.post("/auth/register", {
    email: data.email,
    password: data.password,
    fullName: data.fullName,
  });
  return response.data;
}

// Alias cho tương thích (nếu có code cũ dùng loginApi)
export const loginApi = login;

// Quên mật khẩu - gửi email chứa link reset
export async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
}

// Đặt lại mật khẩu bằng token từ email
export async function resetPassword(token, newPassword) {
  const response = await api.post("/auth/reset-password", { token, newPassword });
  return response.data;
}