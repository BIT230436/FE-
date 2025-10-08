import api from "./apiClient";

// Get list of available mentors
export async function getMentors(filters = {}) {
  const params = new URLSearchParams();

  if (filters.q) params.append("q", filters.q);
  if (filters.status) params.append("status", filters.status);
  if (filters.page !== undefined) params.append("page", filters.page);
  if (filters.size) params.append("size", filters.size);

  const { data } = await api.get(`/mentors?${params.toString()}`);
  return data;
}

// Assign a mentor to an intern
export async function assignMentor({ internId, mentorId }) {
  const { data } = await api.post(`/interns/${internId}/assign-mentor`, {
    mentorId
  });
  return data;
}

// Remove mentor assignment from an intern
export async function unassignMentor(internId) {
  const { data } = await api.delete(`/interns/${internId}/assign-mentor`);
  return data;
}

// Get current mentor assignment for an intern
export async function getInternMentorAssignment(internId) {
  const { data } = await api.get(`/interns/${internId}/mentor-assignment`);
  return data;
}

// Get all intern-mentor assignments with filtering
export async function getMentorAssignments(filters = {}) {
  const params = new URLSearchParams();

  if (filters.q) params.append("q", filters.q);
  if (filters.status) params.append("status", filters.status);
  if (filters.page !== undefined) params.append("page", filters.page);
  if (filters.size) params.append("size", filters.size);

  const { data } = await api.get(`/mentor-assignments?${params.toString()}`);
  return data;
}
