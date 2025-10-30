import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Copy,
  Check,
  Star,
  Award,
  Calendar,
  X,
  Plus,
  Trash2,
  Edit,
  Save,
  MessageSquare,
  FileText,
  TrendingUp,
  ClipboardList,
} from "lucide-react";

import "./ReportManagement.css";

import { getAllPrograms } from "../../services/programService";
import { getDepartmentsByProgram } from "../../services/departmentService";
import { filterProjects } from "../../services/projectService";
import {
  getEvaluationsByIntern,
  getReportsByIntern,
  createReport,
  updateReport,
  deleteReport,
} from "../../services/reportService";

export default function ReportManagement() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [reports, setReports] = useState([]);

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [copiedInternId, setCopiedInternId] = useState(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    summary: "",
    recommendations: "",
    overallScore: 0,
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
      loadReports(selectedIntern.id);
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
      setEvaluations(data || []);
    } catch (err) {
      console.error("Không thể tải evaluations:", err);
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (internId) => {
    try {
      setLoading(true);
      const data = await getReportsByIntern(internId);
      setReports(data || []);
    } catch (err) {
      console.error("Không thể tải báo cáo:", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProgramChange = (e) => {
    setSelectedProgramId(e.target.value);
    setSelectedDepartmentId("");
    setSelectedIntern(null);
    setEvaluations([]);
    setReports([]);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartmentId(e.target.value);
    setSelectedIntern(null);
    setEvaluations([]);
    setReports([]);
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setShowForm(false);
    setEditingReport(null);
  };

  const handleCopyInternId = (internId) => {
    navigator.clipboard.writeText(internId.toString());
    setCopiedInternId(internId);
    setTimeout(() => setCopiedInternId(null), 2000);
  };

  const handleNewReport = () => {
    setShowForm(true);
    setEditingReport(null);
    setFormData({
      summary: "",
      recommendations: "",
      overallScore: 0,
    });
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setShowForm(true);
    setFormData({
      summary: report.summary,
      recommendations: report.recommendations,
      overallScore: report.overallScore,
    });
  };

  const handleSubmitReport = async () => {
    if (!selectedIntern) {
      alert("Vui lòng chọn thực tập sinh");
      return;
    }

    if (!formData.summary.trim()) {
      alert("Vui lòng nhập tóm tắt đánh giá");
      return;
    }

    if (!formData.recommendations.trim()) {
      alert("Vui lòng nhập đề xuất");
      return;
    }

    if (formData.overallScore < 0 || formData.overallScore > 10) {
      alert("Điểm tổng quát phải từ 0 đến 10");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        internId: selectedIntern.id,
        summary: formData.summary,
        recommendations: formData.recommendations,
        overallScore: parseFloat(formData.overallScore),
      };

      if (editingReport) {
        await updateReport(editingReport.reportId, payload);
        alert("Cập nhật báo cáo thành công!");
      } else {
        await createReport(payload);
        alert("Tạo báo cáo thành công!");
      }

      setShowForm(false);
      setEditingReport(null);
      loadReports(selectedIntern.id);
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Bạn có chắc muốn xóa báo cáo này?")) return;

    try {
      setLoading(true);
      await deleteReport(reportId);
      alert("Xóa báo cáo thành công!");
      loadReports(selectedIntern.id);
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReport(null);
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
              <FileText />
            </div>
            <div className="header-text">
              <h1>Báo Cáo Cuối Kỳ Thực Tập Sinh</h1>
              <p>Xem đánh giá định kỳ và tạo báo cáo tổng kết</p>
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

        {/* Report Section */}
        {selectedIntern && (
          <div className="evaluation-section">
            <div className="evaluation-header">
              <div className="evaluation-title-group">
                <div className="evaluation-icon">
                  <FileText />
                </div>
                <div className="evaluation-title-text">
                  <h2>{selectedIntern.fullName}</h2>
                  <p>Đánh giá và báo cáo tổng kết</p>
                </div>
              </div>
            </div>

            {/* Evaluations from Mentor (Read-only) */}
            <div className="evaluations-reference">
              <h3 className="history-title">
                <ClipboardList />
                Đánh giá định kỳ từ Mentor
                <span className="info-badge">Tham khảo</span>
              </h3>
              {evaluations.length === 0 ? (
                <div className="empty-state">
                  <ClipboardList />
                  <p>Chưa có đánh giá định kỳ</p>
                  <small>Mentor chưa tạo đánh giá cho thực tập sinh này</small>
                </div>
              ) : (
                <div className="history-list">
                  {evaluations.map((evaluation) => (
                    <div
                      key={evaluation.evaluationId}
                      className="history-item reference"
                    >
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

            {/* Final Report Section */}
            <div className="final-report-section">
              <div className="section-divider"></div>

              <div className="evaluation-header">
                <h3 className="history-title">
                  <FileText />
                  Báo cáo cuối kỳ của HR
                </h3>
                {!showForm && (
                  <button onClick={handleNewReport} className="btn-primary">
                    <Plus />
                    Tạo báo cáo cuối kỳ
                  </button>
                )}
              </div>

              {/* Report Form */}
              {showForm && (
                <div className="evaluation-form">
                  <h3 className="form-title">
                    <Edit />
                    {editingReport
                      ? "Chỉnh sửa báo cáo"
                      : "Tạo báo cáo cuối kỳ"}
                  </h3>

                  <div className="form-group">
                    <label className="form-label">
                      <TrendingUp />
                      Điểm tổng quát <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.overallScore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          overallScore: e.target.value,
                        })
                      }
                      className="form-input"
                      placeholder="Nhập điểm từ 0 đến 10"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <MessageSquare />
                      Tóm tắt đánh giá <span className="required">*</span>
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      className="form-textarea"
                      rows="6"
                      placeholder="Nhập tóm tắt về kỹ năng, thái độ làm việc, khả năng học hỏi..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Award />
                      Đề xuất <span className="required">*</span>
                    </label>
                    <textarea
                      value={formData.recommendations}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recommendations: e.target.value,
                        })
                      }
                      className="form-textarea"
                      rows="4"
                      placeholder="Nhập đề xuất về tuyển dụng, đào tạo thêm, phát triển..."
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={handleSubmitReport}
                      disabled={loading}
                      className="btn-success"
                    >
                      <Save />
                      {editingReport ? "Cập nhật báo cáo" : "Lưu báo cáo"}
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

              {/* Report History */}
              {reports.length === 0 ? (
                <div className="empty-state">
                  <FileText />
                  <p>Chưa có báo cáo cuối kỳ</p>
                  <small>
                    Hãy tạo báo cáo cuối kỳ dựa trên các đánh giá định kỳ ở trên
                  </small>
                </div>
              ) : (
                <div className="history-list">
                  {reports.map((report) => (
                    <div key={report.reportId} className="history-item final">
                      <div className="history-header">
                        <div>
                          <div className="report-meta">
                            <span
                              className={`score-badge ${getScoreClass(
                                report.overallScore
                              )}`}
                            >
                              <TrendingUp size={16} />
                              Điểm: {report.overallScore}
                            </span>
                            <span className="hr-name">
                              Người đánh giá: {report.hrName}
                            </span>
                          </div>
                          <p className="history-date">
                            {new Date(report.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                        <div className="history-actions">
                          <button
                            onClick={() => handleEditReport(report)}
                            className="btn-icon edit"
                            title="Chỉnh sửa"
                          >
                            <Edit />
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.reportId)}
                            className="btn-icon delete"
                            title="Xóa"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      </div>

                      <div className="report-section">
                        <h4 className="section-label">
                          <MessageSquare size={16} />
                          Tóm tắt đánh giá:
                        </h4>
                        <p className="report-content">{report.summary}</p>
                      </div>

                      <div className="report-section">
                        <h4 className="section-label">
                          <Award size={16} />
                          Đề xuất:
                        </h4>
                        <p className="report-content">
                          {report.recommendations}
                        </p>
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
