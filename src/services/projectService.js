import api from "./apiClient";

// Get all projects for current mentor
export async function getMentorProjects(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.page !== undefined) params.append("page", filters.page);
  if (filters.size) params.append("size", filters.size);
  if (filters.search) params.append("search", filters.search);

  const { data } = await api.get(`/projects/mentor?${params.toString()}`);
  return data;
}

// Get project by ID
export async function getProjectById(projectId) {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
}

// Create new project
export async function createProject(projectData) {
  const { data } = await api.post("/projects", projectData);
  return data;
}

// Update project
export async function updateProject(projectId, projectData) {
  const { data } = await api.put(`/projects/${projectId}`, projectData);
  return data;
}

// Delete project
export async function deleteProject(projectId) {
  const { data } = await api.delete(`/projects/${projectId}`);
  return data;
}

// Get project tasks
export async function getProjectTasks(projectId, filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.assignedTo) params.append("assignedTo", filters.assignedTo);
  if (filters.priority) params.append("priority", filters.priority);

  const { data } = await api.get(`/projects/${projectId}/tasks?${params.toString()}`);
  return data;
}

// Create project task
export async function createProjectTask(projectId, taskData) {
  const { data } = await api.post(`/projects/${projectId}/tasks`, taskData);
  return data;
}

// Update project task
export async function updateProjectTask(projectId, taskId, taskData) {
  const { data } = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
  return data;
}

// Delete project task
export async function deleteProjectTask(projectId, taskId) {
  const { data } = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  return data;
}

// Get project team members
export async function getProjectTeam(projectId) {
  const { data } = await api.get(`/projects/${projectId}/team`);
  return data;
}

// Add team member to project
export async function addTeamMember(projectId, memberData) {
  const { data } = await api.post(`/projects/${projectId}/team`, memberData);
  return data;
}

// Remove team member from project
export async function removeTeamMember(projectId, memberId) {
  const { data } = await api.delete(`/projects/${projectId}/team/${memberId}`);
  return data;
}

// Update task status
export async function updateTaskStatus(projectId, taskId, status) {
  const { data } = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status });
  return data;
}

// Get project statistics
export async function getProjectStats(projectId) {
  const { data } = await api.get(`/projects/${projectId}/stats`);
  return data;
}