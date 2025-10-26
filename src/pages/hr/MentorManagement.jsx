// src/components/HR/HRProjectManagement.js
import React, { useState, useEffect } from "react";
import {
  getAllProjects,
  addInternToProject,
} from "../../services/projectService";
import InternSelectionModal from "../../components/common/InternSelectionModal";
import "./MentorManagement.css";

export default function HRProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Load projects khi component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Lấy danh sách tất cả projects
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể tải danh sách project"
      );
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal chọn intern
  const handleAddIntern = (project) => {
    setSelectedProject(project);
    setShowModal(true);
    setSuccessMessage("");
    setError(null);
  };

  // Xử lý thêm intern vào project
  const handleSelectIntern = async (intern) => {
    if (!selectedProject) return;

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Lấy internId từ object
      const internId =
        intern?.intern_id || intern?.internProfileId || intern?.id;

      console.log("=== DEBUG ADD INTERN ===");
      console.log("Selected Project:", selectedProject);
      console.log("Selected Intern:", intern);
      console.log("Intern ID:", internId);
      console.log("Project ID:", selectedProject.id);
      console.log("=======================");

      if (!internId) {
        setError("Không tìm thấy ID thực tập sinh!");
        setLoading(false);
        return;
      }

      await addInternToProject(selectedProject.id, internId);

      setSuccessMessage(
        `Đã thêm ${intern.student} vào project ${selectedProject.title}`
      );
      setShowModal(false);

      // Reload projects để cập nhật danh sách
      await loadProjects();

      // Clear success message sau 3 giây
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error adding intern:", err);
      setError(
        err.response?.data?.message || "Không thể thêm intern vào project"
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchSearch;
    if (filterStatus === "full")
      return matchSearch && project.internNames?.length >= project.capacity;
    if (filterStatus === "available")
      return matchSearch && project.internNames?.length < project.capacity;

    return matchSearch;
  });

  // Get status info
  const getStatusInfo = (project) => {
    const current = project.internNames?.length || 0;
    const total = project.capacity || 0;
    const isFull = current >= total;

    return {
      current,
      total,
      isFull,
      percentage: total > 0 ? (current / total) * 100 : 0,
    };
  };

  return (
    <div className="hr-project-management">
      <div className="hr-project-container">
        {/* Header */}
        <div className="hr-project-header">
          <div>
            <h1>Quản lý Dự án</h1>
            <p className="header-subtitle">
              Quản lý và phân công thực tập sinh vào các dự án
            </p>
          </div>
          <button
            className="btn-refresh"
            onClick={loadProjects}
            disabled={loading}
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Filters */}
        <div className="hr-project-filters">
          <div className="filter-search">
            <input
              type="text"
              placeholder="🔍 Tìm kiếm dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              Tất cả ({projects.length})
            </button>
            <button
              className={`filter-btn ${
                filterStatus === "available" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("available")}
            >
              Còn chỗ (
              {
                projects.filter(
                  (p) => (p.internNames?.length || 0) < p.capacity
                ).length
              }
              )
            </button>
            <button
              className={`filter-btn ${
                filterStatus === "full" ? "active" : ""
              }`}
              onClick={() => setFilterStatus("full")}
            >
              Đã đủ (
              {
                projects.filter(
                  (p) => (p.internNames?.length || 0) >= p.capacity
                ).length
              }
              )
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">✗</span>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && !showModal ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="hr-project-grid">
              {filteredProjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <h3>Không tìm thấy dự án nào</h3>
                  <p>Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                </div>
              ) : (
                filteredProjects.map((project) => {
                  const status = getStatusInfo(project);
                  return (
                    <div key={project.id} className="hr-project-card">
                      {/* Card Header */}
                      <div className="card-header">
                        <h3>{project.title}</h3>
                        {status.isFull && (
                          <span className="badge-full">Đã đủ</span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="card-description">
                        {project.description || "Chưa có mô tả"}
                      </p>

                      {/* Progress Bar */}
                      <div className="progress-section">
                        <div className="progress-header">
                          <span className="progress-label">
                            Số lượng thực tập sinh
                          </span>
                          <span className="progress-count">
                            {status.current}/{status.total}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${
                              status.isFull ? "full" : ""
                            }`}
                            style={{
                              width: `${Math.min(status.percentage, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Mentor Info */}
                      {project.mentorName && (
                        <div className="card-info-item">
                          <span className="info-icon">👨‍🏫</span>
                          <span className="info-text">
                            <strong>Mentor:</strong> {project.mentorName}
                          </span>
                        </div>
                      )}

                      {/* Intern List */}
                      {project.internNames &&
                        project.internNames.length > 0 && (
                          <div className="intern-section">
                            <div className="intern-header">
                              <span className="intern-icon">👥</span>
                              <span className="intern-label">
                                Thực tập sinh:
                              </span>
                            </div>
                            <div className="intern-tags">
                              {project.internNames
                                .slice(0, 5)
                                .map((name, index) => (
                                  <span key={index} className="intern-tag">
                                    {name}
                                  </span>
                                ))}
                              {project.internNames.length > 5 && (
                                <div className="intern-tag-wrapper">
                                  <span className="intern-tag more">
                                    +{project.internNames.length - 5} khác
                                  </span>
                                  <div className="intern-tooltip">
                                    <div className="tooltip-header">
                                      Tất cả thực tập sinh (
                                      {project.internNames.length})
                                    </div>
                                    <div className="tooltip-list">
                                      {project.internNames.map(
                                        (name, index) => (
                                          <div
                                            key={index}
                                            className="tooltip-item"
                                          >
                                            <span className="tooltip-number">
                                              {index + 1}.
                                            </span>
                                            <span className="tooltip-name">
                                              {name}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Action Button */}
                      <button
                        className={`btn-add-intern ${
                          status.isFull ? "disabled" : ""
                        }`}
                        onClick={() => handleAddIntern(project)}
                        disabled={status.isFull || loading}
                      >
                        {status.isFull
                          ? "✓ Đã đủ số lượng"
                          : "+ Thêm thực tập sinh"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Stats Summary */}
            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-label">Tổng dự án</div>
                  <div className="stat-value">{projects.length}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-label">Tổng thực tập sinh</div>
                  <div className="stat-value">
                    {projects.reduce(
                      (sum, p) => sum + (p.internNames?.length || 0),
                      0
                    )}
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-label">Tổng capacity</div>
                  <div className="stat-value">
                    {projects.reduce((sum, p) => sum + (p.capacity || 0), 0)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Intern Selection Modal */}
      {showModal && (
        <InternSelectionModal
          onClose={() => setShowModal(false)}
          onSelect={handleSelectIntern}
        />
      )}
    </div>
  );
}
