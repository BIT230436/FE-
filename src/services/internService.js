import api from "./apiClient";

export async function getInterns(filters = {}) {
  const params = new URLSearchParams();

  if (filters.q) params.append("q", filters.q);
  if (filters.university) params.append("university", filters.university);
  if (filters.major) params.append("major", filters.major);
  if (filters.program) params.append("program", filters.program);
  if (filters.yearOfStudy) params.append("yearOfStudy", filters.yearOfStudy);
  if (filters.status) params.append("status", filters.status);
  if (filters.page !== undefined) params.append("page", filters.page);
  if (filters.size) params.append("size", filters.size);

  const { data } = await api.get(`/interns?${params.toString()}`);
  return data;
}

export async function getInternById(id) {
  const { data } = await api.get(`/interns/${id}`);
  return data;
}

export async function getUniversities() {
  const { data } = await api.get("/interns/universities");
  return data;
}

export async function getMajors() {
  const { data } = await api.get("/interns/majors");
  return data;
}

export async function getInternStats() {
  const { data } = await api.get("/interns/stats");
  return data;
}


export async function getInternIdByName(name) {
  const { data } = await api.get(`/interns?q=${encodeURIComponent(name)}`);
  return data.map((intern) => ({
    id: intern.id,
    fullname: intern.fullname,
    phone: intern.phone,
    email: intern.email,
  }));
}
