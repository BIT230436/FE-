import api from "./apiClient";

// LIST
export async function getUsers({
  q = "",
  role = "",
  status = "",
  page = 0,
  size = 10,
} = {}) {
  const { data } = await api.get("/admin/users", {
    params: { q, role, status, page, size },
  });
  return data;
}

// CREATE
export async function createUser({
  fullName,
  email,
  role,
  status = "PENDING",
  password,
}) {
  const { data } = await api.post("/admin/users", {
    fullName,
    email,
    role,
    status,
    password,
  });
  return data;
}

// UPDATE
export async function updateUser({ id, fullName, role, status }) {
  const { data } = await api.put(`/admin/users/${id}`, {
    fullName,
    role,
    status,
  });
  return data;
}

// DELETE
export async function deleteUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
}

// APPROVE
export async function approveUser(id) {
  const { data } = await api.put(`/admin/approve/${id}`);
  return data;
}
