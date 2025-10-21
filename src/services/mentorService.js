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
  const { data } = await api.post(`/mentors/assign`, {
    internId,
    mentorId
  });
  return data;
}

// Remove mentor assignment from an intern
export async function unassignMentor(internId, mentorId) {
  const { data } = await api.delete(`/mentors/unassign`, {
    params: { mentorId, internId }
  });
  return data;
}

// Get current mentor assignment for an intern
export async function getInternMentorAssignment(internId) {
  const { data } = await api.get(`/mentors/by-intern/${internId}`);
  return data;
}

// Get all intern-mentor assignments with filtering
export async function getMentorAssignments(filters = {}) {
  const params = new URLSearchParams();

  // Backend chỉ accept mentorId param
  if (filters.mentorId) params.append("mentorId", filters.mentorId);

  const queryString = params.toString();
  const url = queryString ? `/mentors/assignments?${queryString}` : `/mentors/assignments`;
  
  const { data } = await api.get(url);
  return data;
}
