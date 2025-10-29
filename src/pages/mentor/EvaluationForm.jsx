import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Star,
  Award,
  Calendar,
  MessageSquare,
} from "lucide-react";

import "./EvaluationForm.css";

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

  const getScoreClass = (score) => {
    if (score >= 8) return "excellent";
    if (score >= 6) return "good";
    if (score >= 4) return "average";
    return "poor";
  };

  return (
    <div className="evaluation-page">
      <div className="container">
        {/* Header Section */}
        <div className="header-card">
          <div className="header-title">
            <div className="header-icon">
              <Award />
            </div>
            <div className="header-text">
              <h1>Đánh Giá Thực Tập Sinh</h1>
              <p>Quản lý và theo dõi tiến độ của thực tập sinh</p>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <X />
              <span>{error}</span>
            </div>
          )}

          {/* Filter Section */}
          <div className="filter-grid">
            <div className="form-group">
              <label className="form-label">
                <BookOpen />
                Chương trình <span className="required">*</span>
              </label>
              <select
                value={selectedProgramId}
                onChange={handleProgramChange}
                className="form-select"
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

            <div className="form-group">
              <label className="form-label">
                <Users />
                Phòng ban (Tùy chọn)
              </label>
              <select
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                className="form-select"
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* Interns Grid */}
        {!loading && selectedProgramId && (
          <div className="interns-card">
            <div className="section-header">
              <h2 className="section-title">
                <Users />
                Danh sách thực tập sinh
                <span className="count-badge">{interns.length}</span>
              </h2>
            </div>

            {interns.length === 0 ? (
              <div className="empty-state">
                <Users />
                <p>Không có thực tập sinh nào</p>
                <small>Vui lòng chọn chương trình khác</small>
              </div>
            ) : (
              <div className="interns-grid">
                {interns.map((intern) => (
                  <div
                    key={`${intern.id}-${intern.projectId}`}
                    className={`intern-card ${
                      selectedIntern?.id === intern.id ? "selected" : ""
                    }`}
                    onClick={() => handleSelectIntern(intern)}
                  >
                    {selectedIntern?.id === intern.id && (
                      <div className="selected-badge">
                        <Check />
                      </div>
                    )}

                    <div className="intern-header">
                      <div>
                        <h3 className="intern-name">{intern.fullName}</h3>
                        <div className="intern-id">
                          <span>ID: {intern.id}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyInternId(intern.id);
                            }}
                            className={`copy-btn ${
                              copiedInternId === intern.id ? "copied" : ""
                            }`}
                            title="Copy ID"
                          >
                            {copiedInternId === intern.id ? (
                              <Check />
                            ) : (
                              <Copy />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="intern-info">
                      <div className="info-row">
                        <BookOpen style={{ color: "#667eea" }} />
                        <div>
                          <span className="info-label">Dự án</span>
                          <span className="info-value">
                            {intern.projectTitle}
                          </span>
                        </div>
                      </div>
                      <div className="info-row">
                        <Star style={{ color: "#f59e0b" }} />
                        <div>
                          <span className="info-label">Mentor</span>
                          <span className="info-value">
                            {intern.mentorName || "Chưa có"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evaluation Section */}
        {selectedIntern && (
          <div className="evaluation-section">
            <div className="evaluation-header">
              <div className="evaluation-title-group">
                <div className="evaluation-icon">
                  <Award />
                </div>
                <div className="evaluation-title-text">
                  <h2>{selectedIntern.fullName}</h2>
                  <p>Quản lý đánh giá và theo dõi tiến độ</p>
                </div>
              </div>
              {!showForm && (
                <button onClick={handleNewEvaluation} className="btn-primary">
                  <Plus />
                  Tạo đánh giá mới
                </button>
              )}
            </div>

            {/* Evaluation Form */}
            {showForm && (
              <div className="evaluation-form">
                <h3 className="form-title">
                  <Edit />
                  {editingEvaluation
                    ? "Chỉnh sửa đánh giá"
                    : "Tạo đánh giá mới"}
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <Calendar />
                      Chu kỳ <span className="required">*</span>
                    </label>
                    <select
                      value={formData.cycle}
                      onChange={(e) =>
                        setFormData({ ...formData, cycle: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="weekly">Hàng tuần</option>
                      <option value="monthly">Hàng tháng</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Star />
                      Kỳ số <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.periodNo}
                      onChange={(e) =>
                        setFormData({ ...formData, periodNo: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <MessageSquare />
                    Nhận xét chung
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    className="form-textarea"
                    placeholder="Nhận xét tổng quan về thực tập sinh..."
                  />
                </div>

                <div>
                  <div className="criteria-header">
                    <label className="criteria-label">
                      <Award />
                      Tiêu chí đánh giá <span className="required">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddCriteria}
                      className="btn-add"
                    >
                      <Plus />
                      Thêm tiêu chí
                    </button>
                  </div>

                  <div className="criteria-list">
                    {formData.scores.map((score, index) => (
                      <div key={index} className="criteria-item">
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
                        />
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
                        />
                        <input
                          type="text"
                          placeholder="Nhận xét"
                          value={score.comment}
                          onChange={(e) =>
                            handleScoreChange(index, "comment", e.target.value)
                          }
                        />
                        {formData.scores.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCriteria(index)}
                            className="btn-remove"
                            title="Xóa tiêu chí"
                          >
                            <Trash2 />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleSubmitEvaluation}
                    disabled={loading}
                    className="btn-success"
                  >
                    <Save />
                    {editingEvaluation ? "Cập nhật đánh giá" : "Lưu đánh giá"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="btn-cancel"
                  >
                    <X />
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Evaluation History */}
            <div>
              <h3 className="history-title">
                <Calendar />
                Lịch sử đánh giá
              </h3>
              {evaluations.length === 0 ? (
                <div className="empty-state">
                  <Award />
                  <p>Chưa có đánh giá nào</p>
                  <small>Hãy tạo đánh giá đầu tiên cho thực tập sinh này</small>
                </div>
              ) : (
                <div className="history-list">
                  {evaluations.map((evaluation) => (
                    <div key={evaluation.evaluationId} className="history-item">
                      <div className="history-header">
                        <div>
                          <div className="history-meta">
                            <span className="cycle-badge">
                              {evaluation.cycle}
                            </span>
                            <span className="period-text">
                              Kỳ {evaluation.periodNo}
                            </span>
                          </div>
                          <p className="history-date">
                            {new Date(evaluation.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                        <div className="history-actions">
                          <button
                            onClick={() => handleEditEvaluation(evaluation)}
                            className="btn-icon edit"
                            title="Chỉnh sửa"
                          >
                            <Edit />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteEvaluation(evaluation.evaluationId)
                            }
                            className="btn-icon delete"
                            title="Xóa"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>

                      {evaluation.comment && (
                        <p className="history-comment">
                          "{evaluation.comment}"
                        </p>
                      )}

                      <div className="scores-list">
                        {evaluation.scores.map((score, idx) => (
                          <div key={idx} className="score-item">
                            <div className="score-content">
                              <span className="score-name">
                                {score.criteriaName}
                              </span>
                              {score.comment && (
                                <p className="score-comment">{score.comment}</p>
                              )}
                            </div>
                            <span
                              className={`score-value ${getScoreClass(
                                score.score
                              )}`}
                            >
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
