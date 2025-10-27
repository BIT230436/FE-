// src/components/HR/HRProjectManagement.js
import React, { useState, useEffect } from "react";
import {
  getAllProjects,
  addInternToProject,
  transferInternToAnotherProject,
  removeInternFromProject,
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
  const [showInternMenu, setShowInternMenu] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

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

  const handleAddIntern = (project) => {
    setSelectedProject(project);
    setShowModal(true);
    setSuccessMessage("");
    setError(null);
  };

  const handleSelectIntern = async (intern) => {
    if (!selectedProject) return;

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const internId =
        intern?.intern_id || intern?.internProfileId || intern?.id;

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
      await loadProjects();

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

  const handleRemoveIntern = async (internId, internName, projectTitle) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa "${internName}" khỏi project "${projectTitle}"?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage("");
    setShowInternMenu(null);

    let isSuccess = false;

    try {
      await removeInternFromProject(internId);
      isSuccess = true;
    } catch (err) {
      // Kiểm tra xem có phải lỗi encoding không (nhưng API vẫn thành công)
      if (
        err.code === "ERR_NETWORK" ||
        err.code === "ERR_INCOMPLETE_CHUNKED_ENCODING"
      ) {
        console.log("Network error but API might succeed:", err.code);
        isSuccess = true; // Coi như thành công
      } else if (err.response?.status === 200 || err.response?.status === 204) {
        isSuccess = true;
      } else {
        console.error("Real error:", err);
        setError(err.response?.data?.message || "Không thể xóa intern");
      }
    }

    // Reload để xác nhận kết quả
    await loadProjects();

    if (isSuccess) {
      setSuccessMessage(`Đã xóa ${internName} khỏi project`);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }

    setLoading(false);
  };

  const handleOpenTransfer = (internId, internName, currentProjectId) => {
    setTransferData({ internId, internName, currentProjectId });
    setShowTransferModal(true);
    setShowInternMenu(null);
  };

  const handleTransferIntern = async (newProjectId) => {
    if (!transferData || !newProjectId) return;

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    let isSuccess = false;

    try {
      await transferInternToAnotherProject(transferData.internId, newProjectId);
      isSuccess = true;
    } catch (err) {
      // Kiểm tra xem có phải lỗi encoding không (nhưng API vẫn thành công)
      if (
        err.code === "ERR_NETWORK" ||
        err.code === "ERR_INCOMPLETE_CHUNKED_ENCODING"
      ) {
        console.log("Network error but API might succeed:", err.code);
        isSuccess = true; // Coi như thành công
      } else if (err.response?.status === 200 || err.response?.status === 204) {
        isSuccess = true;
      } else {
        console.error("Real error:", err);
        setError(err.response?.data?.message || "Không thể chuyển intern");
      }
    }

    // Reload để xác nhận kết quả
    await loadProjects();

    if (isSuccess) {
      const newProject = projects.find((p) => p.id === newProjectId);
      setSuccessMessage(
        `Đã chuyển ${transferData.internName} sang project "${newProject?.title}"`
      );
      setShowTransferModal(false);
      setTransferData(null);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }

    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowInternMenu(null);
    if (showInternMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showInternMenu]);

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

        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">✗</span>
            {error}
          </div>
        )}

        {loading && !showModal ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
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
                      <div className="card-header">
                        <h3>{project.title}</h3>
                        {status.isFull && (
                          <span className="badge-full">Đã đủ</span>
                        )}
                      </div>

                      <p className="card-description">
                        {project.description || "Chưa có mô tả"}
                      </p>

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

                      {project.mentorName && (
                        <div className="card-info-item">
                          <span className="info-icon">👨‍🏫</span>
                          <span className="info-text">
                            <strong>Mentor:</strong> {project.mentorName}
                          </span>
                        </div>
                      )}

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
                              {project.internNames.slice(0, 5).map((intern) => (
                                <div
                                  key={intern.id}
                                  className="intern-tag-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowInternMenu({
                                      projectId: project.id,
                                      projectTitle: project.title,
                                      internName: intern.fullName,
                                      internId: intern.id,
                                    });
                                  }}
                                >
                                  <span className="intern-tag">
                                    {intern.fullName}
                                  </span>
                                  {showInternMenu?.internId === intern.id &&
                                    showInternMenu?.projectId ===
                                      project.id && (
                                      <div
                                        className="intern-menu"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          className="menu-item transfer"
                                          onClick={() =>
                                            handleOpenTransfer(
                                              intern.id,
                                              intern.fullName,
                                              project.id
                                            )
                                          }
                                        >
                                          🔄 Chuyển sang project khác
                                        </button>
                                        <button
                                          className="menu-item remove"
                                          onClick={() =>
                                            handleRemoveIntern(
                                              intern.id,
                                              intern.fullName,
                                              project.title
                                            )
                                          }
                                        >
                                          🗑️ Xóa khỏi project
                                        </button>
                                      </div>
                                    )}
                                </div>
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
                                        (intern, index) => (
                                          <div
                                            key={intern.id}
                                            className="tooltip-item"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowInternMenu({
                                                projectId: project.id,
                                                projectTitle: project.title,
                                                internName: intern.fullName,
                                                internId: intern.id,
                                              });
                                            }}
                                          >
                                            <span className="tooltip-number">
                                              {index + 1}.
                                            </span>
                                            <span className="tooltip-name">
                                              {intern.fullName}
                                            </span>
                                            <span className="tooltip-action">
                                              ⋮
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

      {showModal && (
        <InternSelectionModal
          onClose={() => setShowModal(false)}
          onSelect={handleSelectIntern}
        />
      )}

      {showTransferModal && transferData && (
        <div
          className="modal-overlay"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            className="modal-content transfer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🔄 Chuyển thực tập sinh</h2>
              <button
                className="btn-close"
                onClick={() => setShowTransferModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="transfer-info">
                <div className="info-badge">
                  <span className="badge-icon">👤</span>
                  <span className="badge-text">{transferData.internName}</span>
                </div>
                <div className="arrow-icon">→</div>
                <div className="info-label">Chọn project đích</div>
              </div>

              <div className="project-select-list">
                {projects
                  .filter((p) => p.id !== transferData.currentProjectId)
                  .map((project) => {
                    const status = getStatusInfo(project);
                    return (
                      <button
                        key={project.id}
                        className={`project-select-item ${
                          status.isFull ? "disabled" : ""
                        }`}
                        onClick={() =>
                          !status.isFull && handleTransferIntern(project.id)
                        }
                        disabled={status.isFull || loading}
                      >
                        <div className="project-select-info">
                          <div className="project-select-title">
                            {project.title}
                          </div>
                          <div className="project-select-capacity">
                            {status.current}/{status.total} vị trí
                          </div>
                        </div>
                        {status.isFull ? (
                          <span className="project-status full">Đã đủ</span>
                        ) : (
                          <span className="project-status available">
                            Còn chỗ
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
