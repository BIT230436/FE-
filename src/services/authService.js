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