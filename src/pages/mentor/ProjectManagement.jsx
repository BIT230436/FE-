// src/components/ProjectManagement.jstạo
import React, { useState, useEffect } from "react";
import {
  getProjectsByCurrentMentor,
  createProject,
  updateProject,
  deleteProject,
} from "../../services/projectService";
import "./ProjectManagement.css";

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    capacity: 1,
  });

  // Load projects khi component mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Lấy danh sách projects
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectsByCurrentMentor();
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

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
  };

  // Mở modal tạo mới
  const handleCreate = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      description: "",
      capacity: 1,
    });
    setShowModal(true);
  };

  // Mở modal chỉnh sửa
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      capacity: project.capacity || 1,
    });
    setShowModal(true);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData);
      } else {
        await createProject(formData);
      }
      setShowModal(false);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
      console.error("Error saving project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Xóa project
  const handleDelete = async (projectId) => {
    if (!window.confirm("Bạn có chắc muốn xóa project này?")) return;

    setLoading(true);
    setError(null);
    try {
      await deleteProject(projectId);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể xóa project");
      console.error("Error deleting project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Đóng modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setError(null);
  };

  return (
    <div className="project-management">
      <div className="project-header">
        <h1>Quản lý Project</h1>
        <button className="btn-primary" onClick={handleCreate}>
          <span className="icon">+</span> Tạo Project Mới
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {loading && !showModal ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>Chưa có project nào</h3>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="card-header">
                  <h3>{project.title}</h3>
                  <span className="capacity-badge">
                    {project.internNames?.length || 0}/{project.capacity}
                  </span>
                </div>

                <p className="card-description">
                  {project.description || "Chưa có mô tả"}
                </p>

                <div className="card-info">
                  <div className="info-item">
                    <span className="info-icon">👥</span>
                    <div className="info-content">
                      <span className="info-label">Số lượng:</span>
                      <span className="info-value">
                        {project.capacity} vị trí
                      </span>
                    </div>
                  </div>

                  {project.mentorName && (
                    <div className="info-item">
                      <span className="info-icon">👨‍🏫</span>
                      <div className="info-content">
                        <span className="info-label">Mentor:</span>
                        <span className="info-value">{project.mentorName}</span>
                      </div>
                    </div>
                  )}

                  {project.internNames && project.internNames.length > 0 && (
                    <div className="info-item">
                      <span className="info-icon">👨‍💻</span>
                      <div className="info-content">
                        <span className="info-label">Interns:</span>
                        <div className="intern-list">
                          {project.internNames
                            .slice(0, 3)
                            .map((name, index) => (
                              <span key={index} className="intern-tag">
                                {name}
                              </span>
                            ))}
                          {project.internNames.length > 3 && (
                            <span className="intern-tag more">
                              +{project.internNames.length - 3} khác
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(project)}
                    disabled={loading}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(project.id)}
                    disabled={loading}
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingProject ? "Chỉnh sửa Project" : "Tạo Project Mới"}
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-group">
                <label htmlFor="title">
                  Tên Project <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên project (vd: AI Internship Program)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Nhập mô tả chi tiết về project..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="capacity">
                  Số lượng vị trí <span className="required">*</span>
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Nhập số lượng intern có thể tham gia"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? "Đang lưu..."
                    : editingProject
                    ? "Cập nhật"
                    : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
