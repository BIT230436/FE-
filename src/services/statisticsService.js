import api from "./apiClient";

/**
 * Lấy thống kê tổng quan về thực tập sinh
 */
export async function getInternCompletionStats() {
  try {
    const { data } = await api.get("/statistics/intern-completion");
    return data.data;
  } catch (error) {
    console.error("Error fetching intern completion stats:", error);
    throw error;
  }
}

/**
 * Lấy thống kê theo chương trình thực tập
 * @param {Object} filters - { programId, mentorId, major }
 */
export async function getProgramCompletionStats(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.programId) params.append("programId", filters.programId);
    if (filters.mentorId) params.append("mentorId", filters.mentorId);
    if (filters.major) params.append("major", filters.major);

    const { data } = await api.get(
      `/statistics/program-completion?${params.toString()}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching program completion stats:", error);
    throw error;
  }
}

/**
 * Lấy danh sách chương trình thực tập (cho filter)
 */
export async function getPrograms() {
  try {
    const { data } = await api.get("/statistics/programs");
    return data.data || [];
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
}

/**
 * Lấy danh sách mentor (cho filter)
 */
export async function getMentors() {
  try {
    const { data } = await api.get("/statistics/mentors");
    return data.data || [];
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return [];
  }
}

/**
 * Lấy danh sách chuyên ngành (cho filter)
 */
export async function getMajors() {
  try {
    const { data } = await api.get("/statistics/majors");
    return data.data || [];
  } catch (error) {
    console.error("Error fetching majors:", error);
    return [];
  }
}

/**
 * Lấy thống kê tiến độ theo thời gian
 * @param {Object} filters - { programId, mentorId, major }
 */
export async function getProgressOverTime(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.programId) params.append("programId", filters.programId);
    if (filters.mentorId) params.append("mentorId", filters.mentorId);
    if (filters.major) params.append("major", filters.major);

    const { data } = await api.get(
      `/statistics/progress-timeline?${params.toString()}`
    );
    return data.data;
  } catch (error) {
    console.error("Error fetching progress timeline:", error);
    throw error;
  }
}
