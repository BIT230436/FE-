import api from "./apiClient";

export async function createProgram(programData, userId) {
  // đổi tên userId thành hrId để backend hiểu đúng
  const payload = {
    programName: programData.programName,
    description: programData.description,
    dateCreate: programData.dateCreate,
    dateEnd: programData.dateEnd,
    hrId: userId, 
  };

  const response = await api.post("/programs", payload);
  return response.data;
}


export async function getAllPrograms() {
  const response = await api.get("/programs");
  const rows = response.data || [];

  return rows.map((p) => ({
    id: p.id,
    programName: p.programName,
    dateCreate: p.dateCreate,
    dateEnd: p.dateEnd,
    description: p.description,
    hrId: p.hrId || null,
    hrName: p.hrName || "Không rõ",
    uploadedAt: p.uploadedAt,
  }));
}

export async function getProgramById(id) {
  const response = await api.get(`/programs/${id}`);
  return response.data;
}

export async function updateProgram(id, programData) {
  const response = await api.put(`/programs/${id}`, programData);
  return response.data;
}

export async function deleteProgram(id) {
  const response = await api.delete(`/programs/${id}`);
  return response.data;
}
