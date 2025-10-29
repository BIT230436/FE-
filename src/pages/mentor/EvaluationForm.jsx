import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  BookOpen,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";

import { getAllPrograms } from "../../services/programService";
import { getDepartmentsByProgram } from "../../services/departmentService";
import { filterProjects } from "../../services/projectService";
import {
  createMentorEvaluation,
  updateMentorEvaluation,
  deleteMentorEvaluation,
  getEvaluationsByIntern,
} from "../../services/reportService";

export default function MentorReviewInterns() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [evaluations, setEvaluations] = useState([]);

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [copiedInternId, setCopiedInternId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState(null);
  const [formData, setFormData] = useState({
    comment: "",
    cycle: "monthly",
    periodNo: 1,
    scores: [{ criteriaName: "", score: 0, comment: "" }],
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      loadDepartments(selectedProgramId);
      loadProjects(selectedProgramId, null);
    } else {
      setDepartments([]);
      setProjects([]);
      setInterns([]);
      setSelectedDepartmentId("");
    }
  }, [selectedProgramId]);

  useEffect(() => {
    if (selectedProgramId && selectedDepartmentId) {
      loadProjects(selectedProgramId, selectedDepartmentId);
    }
  }, [selectedDepartmentId]);

  useEffect(() => {
    if (selectedIntern) {
      loadEvaluations(selectedIntern.id);
    }
  }, [selectedIntern]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllPrograms();
      setPrograms(data);
    } catch (err) {
      setError("Không thể tải danh sách chương trình");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async (programId) => {
    try {
      setLoading(true);
      setError("");
      const data = await getDepartmentsByProgram(programId);
      setDepartments(data);
    } catch (err) {
      setError("Không thể tải danh sách phòng ban");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (programId, departmentId) => {
    try {
      setLoading(true);
      setError("");
      const data = await filterProjects(programId, departmentId);
      setProjects(data);

      const allInterns = [];
      data.forEach((project) => {
        if (project.internNames && Array.isArray(project.internNames)) {
          project.internNames.forEach((intern) => {
            allInterns.push({
              ...intern,
              projectId: project.id,
              projectTitle: project.title,
              mentorName: project.mentorName,
              mentorId: project.mentorId,
            });
          });
        }
      });
      setInterns(allInterns);
    } catch (err) {
      setError("Không thể tải danh sách dự án");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvaluations = async (internId) => {
    try {
      setLoading(true);
      const data = await getEvaluationsByIntern(internId);
      setEvaluations(data);
    } catch (err) {
      console.error("Không thể tải evaluations:", err);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramChange = (e) => {
    setSelectedProgramId(e.target.value);
    setSelectedDepartmentId("");
    setSelectedIntern(null);
    setEvaluations([]);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartmentId(e.target.value);
    setSelectedIntern(null);
    setEvaluations([]);
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setShowForm(false);
    setEditingEvaluation(null);
  };

  const handleCopyInternId = (internId) => {
    navigator.clipboard.writeText(internId.toString());
    setCopiedInternId(internId);
    setTimeout(() => setCopiedInternId(null), 2000);
  };

  const handleAddCriteria = () => {
    setFormData({
      ...formData,
      scores: [...formData.scores, { criteriaName: "", score: 0, comment: "" }],
    });
  };

  const handleRemoveCriteria = (index) => {
    const newScores = formData.scores.filter((_, i) => i !== index);
    setFormData({ ...formData, scores: newScores });
  };

  const handleScoreChange = (index, field, value) => {
    const newScores = [...formData.scores];
    newScores[index][field] =
      field === "score" ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, scores: newScores });
  };

  const handleNewEvaluation = () => {
    setShowForm(true);
    setEditingEvaluation(null);
    setFormData({
      comment: "",
      cycle: "monthly",
      periodNo: 1,
      scores: [{ criteriaName: "", score: 0, comment: "" }],
    });
  };

  const handleEditEvaluation = (evaluation) => {
    setEditingEvaluation(evaluation);
    setShowForm(true);
    setFormData({
      comment: evaluation.comment,
      cycle: evaluation.cycle,
      periodNo: evaluation.periodNo,
      scores: evaluation.scores.map((s) => ({
        criteriaName: s.criteriaName,
        score: s.score,
        comment: s.comment,
      })),
    });
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedIntern) {
      alert("Vui lòng chọn thực tập sinh");
      return;
    }

    const validScores = formData.scores.filter(
      (s) => s.criteriaName.trim() !== ""
    );
    if (validScores.length === 0) {
      alert("Vui lòng thêm ít nhất một tiêu chí đánh giá");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        internId: selectedIntern.id,
        comment: formData.comment,
        cycle: formData.cycle,
        periodNo: parseInt(formData.periodNo),
        scores: validScores,
      };

      if (editingEvaluation) {
        await updateMentorEvaluation(editingEvaluation.evaluationId, payload);
        alert("Cập nhật evaluation thành công!");
      } else {
        await createMentorEvaluation(payload);
        alert("Tạo evaluation thành công!");
      }

      setShowForm(false);
      setEditingEvaluation(null);
      loadEvaluations(selectedIntern.id);
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvaluation = async (evaluationId) => {
    if (!window.confirm("Bạn có chắc muốn xóa evaluation này?")) return;

    try {
      setLoading(true);
      await deleteMentorEvaluation(evaluationId);
      alert("Xóa evaluation thành công!");
      loadEvaluations(selectedIntern.id);
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEvaluation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Mentor Review - Đánh Giá Thực Tập Sinh
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chương trình <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProgramId}
                onChange={handleProgramChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">-- Chọn chương trình --</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.programName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phòng ban (Tùy chọn)
              </label>
              <select
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading || !selectedProgramId}
              >
                <option value="">-- Tất cả phòng ban --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.departmentName} (Sức chứa: {dept.capacity})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          )}

          {!loading && selectedProgramId && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Danh sách thực tập sinh ({interns.length})
                </h2>
              </div>

              {interns.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Không có thực tập sinh nào trong chương trình này
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interns.map((intern) => (
                    <div
                      key={`${intern.id}-${intern.projectId}`}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedIntern?.id === intern.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                      }`}
                      onClick={() => handleSelectIntern(intern)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {intern.fullName}
                          </h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            ID: {intern.id}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyInternId(intern.id);
                              }}
                              className="ml-1 p-1 hover:bg-gray-200 rounded"
                              title="Copy ID"
                            >
                              {copiedInternId === intern.id ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-600" />
                              )}
                            </button>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 min-w-fit">
                            Dự án:
                          </span>
                          <span className="text-gray-900 font-medium">
                            {intern.projectTitle}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500 min-w-fit">
                            Mentor:
                          </span>
                          <span className="text-gray-700">
                            {intern.mentorName || "Chưa có"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedIntern && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Đánh giá cho: {selectedIntern.fullName}
              </h2>
              {!showForm && (
                <button
                  onClick={handleNewEvaluation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tạo đánh giá mới
                </button>
              )}
            </div>

            {showForm && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">
                  {editingEvaluation
                    ? "Chỉnh sửa đánh giá"
                    : "Tạo đánh giá mới"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chu kỳ <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.cycle}
                      onChange={(e) =>
                        setFormData({ ...formData, cycle: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kỳ số <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.periodNo}
                      onChange={(e) =>
                        setFormData({ ...formData, periodNo: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nhận xét chung
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhận xét tổng quan về thực tập sinh..."
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Tiêu chí đánh giá <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCriteria}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm tiêu chí
                    </button>
                  </div>

                  {formData.scores.map((score, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 mb-3 p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Tên tiêu chí"
                          value={score.criteriaName}
                          onChange={(e) =>
                            handleScoreChange(
                              index,
                              "criteriaName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Điểm"
                          min="0"
                          max="10"
                          step="0.5"
                          value={score.score}
                          onChange={(e) =>
                            handleScoreChange(index, "score", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Nhận xét"
                          value={score.comment}
                          onChange={(e) =>
                            handleScoreChange(index, "comment", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-1 flex items-center">
                        {formData.scores.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCriteria(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitEvaluation}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    <Save className="w-4 h-4" />
                    {editingEvaluation ? "Cập nhật" : "Lưu đánh giá"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">Lịch sử đánh giá</h3>
              {evaluations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Chưa có đánh giá nào
                </p>
              ) : (
                <div className="space-y-4">
                  {evaluations.map((evaluation) => (
                    <div
                      key={evaluation.evaluationId}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                              {evaluation.cycle}
                            </span>
                            <span className="text-sm text-gray-600">
                              Kỳ {evaluation.periodNo}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(evaluation.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditEvaluation(evaluation)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteEvaluation(evaluation.evaluationId)
                            }
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {evaluation.comment && (
                        <p className="text-gray-700 mb-3 italic">
                          "{evaluation.comment}"
                        </p>
                      )}

                      <div className="space-y-2">
                        {evaluation.scores.map((score, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">
                                {score.criteriaName}
                              </span>
                              {score.comment && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {score.comment}
                                </p>
                              )}
                            </div>
                            <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 font-semibold rounded">
                              {score.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
