import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import {
  getMentorProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  createProjectTask,
  updateTaskStatus,
} from "../../services/projectService";
import "./ProjectManagement.css";

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Debounce search text
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {};
      if (debouncedSearchText) filters.search = debouncedSearchText;
      if (filterStatus) filters.status = filterStatus;

      const response = await getMentorProjects(filters);
      const projectsData = response.data || response.content || response || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Không thể tải danh sách dự án.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, filterStatus]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (projectData) => {
    try {
      const response = await createProject(projectData);
      if (response.success) {
        toast.success("Tạo dự án thành công!");
        setShowCreateModal(false);
        fetchProjects();
      } else {
        toast.error(response.message || "Tạo dự án thất bại!");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      const errorMsg = error?.response?.data?.message || "Tạo dự án thất bại.";
      toast.error(errorMsg);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!globalThis.confirm("Bạn có chắc chắn muốn xóa dự án này?")) {
      return;
    }

    try {
      await deleteProject(projectId);
      toast.success("Xóa dự án thành công!");
      fetchProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Xóa dự án thất bại!");
    }
  };

  const handleViewTasks = (project) => {
    setSelectedProject(project);
    setShowTaskModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "#28a745";
      case "COMPLETED":
        return "#007bff";
      case "ON_HOLD":
        return "#ffc107";
      case "CANCELLED":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Hoàn thành";
      case "ON_HOLD":
        return "Tạm dừng";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Chưa xác định";
    }
  };

  return (
    <div className="project-management-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý Dự án</h1>
        <div className="header-actions">
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              📋 Grid
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              📝 List
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Tạo Dự án Mới
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm dự án..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang thực hiện</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="ON_HOLD">Tạm dừng</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải danh sách dự án...</p>
        </div>
      )}

      {/* Projects Display */}
      {!loading && (
        <>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h3>Chưa có dự án nào</h3>
              <p>Bắt đầu tạo dự án đầu tiên của bạn</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Tạo Dự án Mới
              </button>
            </div>
          ) : (
            <div className={`projects-display ${viewMode}`}>
              {projects.map((project) => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <div className="project-title-section">
                      <h3 className="project-title">{project.name}</h3>
                      <span
                        className="project-status"
                        style={{
                          backgroundColor: getStatusColor(project.status),
                          color: "white",
                        }}
                      >
                        {getStatusText(project.status)}
                      </span>
                    </div>
                    <div className="project-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleViewTasks(project)}
                        title="Xem công việc"
                      >
                        📋
                      </button>
                      <button
                        className="btn-icon edit"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteProject(project.id)}
                        title="Xóa dự án"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="project-description">
                    {project.description || "Chưa có mô tả"}
                  </div>

                  <div className="project-meta">
                    <div className="meta-item">
                      <span className="meta-label">Thời gian:</span>
                      <span className="meta-value">
                        {project.startDate && project.endDate
                          ? `${project.startDate} - ${project.endDate}`
                          : "Chưa xác định"}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Thành viên:</span>
                      <span className="meta-value">
                        {project.teamSize || 0} người
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Công việc:</span>
                      <span className="meta-value">
                        {project.taskCount || 0} việc
                      </span>
                    </div>
                  </div>

                  <div className="project-progress">
                    <div className="progress-info">
                      <span>Tiến độ: {project.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleCreateProject}
        />
      )}

      {/* Task Management Modal */}
      {showTaskModal && selectedProject && (
        <TaskManagementModal
          project={selectedProject}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedProject(null);
          }}
          onTaskUpdated={fetchProjects}
        />
      )}
    </div>
  );
};

export default ProjectManagement;

// --- CreateProjectModal Component ---
function CreateProjectModal({ onClose, onProjectCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên dự án!");
      return;
    }

    try {
      await onProjectCreated(formData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box large">
        <h2 className="modal-title">Tạo Dự án Mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="project-name">Tên dự án *</label>
            <input
              type="text"
              id="project-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên dự án..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="project-description">Mô tả</label>
            <textarea
              id="project-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về dự án..."
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date">Ngày bắt đầu</label>
              <input
                type="date"
                id="start-date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="end-date">Ngày kết thúc</label>
              <input
                type="date"
                id="end-date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="project-status">Trạng thái</label>
            <select
              id="project-status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Đang thực hiện</option>
              <option value="ON_HOLD">Tạm dừng</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Tạo Dự án
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- TaskManagementModal Component ---
function TaskManagementModal({ project, onClose, onTaskUpdated }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedTo: "",
    dueDate: "",
  });

  useEffect(() => {
    loadTasks();
  }, [project.id]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await getProjectTasks(project.id);
      const tasksData = response.data || response || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast.error("Không thể tải danh sách công việc!");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề công việc!");
      return;
    }

    try {
      await createProjectTask(project.id, newTask);
      toast.success("Tạo công việc thành công!");
      setNewTask({
        title: "",
        description: "",
        priority: "MEDIUM",
        assignedTo: "",
        dueDate: "",
      });
      loadTasks();
      onTaskUpdated();
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Tạo công việc thất bại!");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(project.id, taskId, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      loadTasks();
      onTaskUpdated();
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "#dc3545";
      case "MEDIUM":
        return "#ffc107";
      case "LOW":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "TODO":
        return "#6c757d";
      case "IN_PROGRESS":
        return "#007bff";
      case "DONE":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box large">
        <div className="modal-header">
          <h2 className="modal-title">Quản lý Công việc - {project.name}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="task-management-content">
          {/* Create Task Form */}
          <div className="create-task-section">
            <h3>Tạo Công việc Mới</h3>
            <form onSubmit={handleCreateTask} className="create-task-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tiêu đề *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Nhập tiêu đề công việc..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Độ ưu tiên</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, priority: e.target.value }))
                    }
                  >
                    <option value="LOW">Thấp</option>
                    <option value="MEDIUM">Trung bình</option>
                    <option value="HIGH">Cao</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Mô tả chi tiết công việc..."
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày hoàn thành</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Giao cho</label>
                  <input
                    type="text"
                    value={newTask.assignedTo}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, assignedTo: e.target.value }))
                    }
                    placeholder="Tên người thực hiện..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Tạo Công việc
                </button>
              </div>
            </form>
          </div>

          {/* Tasks List */}
          <div className="tasks-section">
            <h3>Danh sách Công việc ({tasks.length})</h3>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Đang tải danh sách công việc...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>Chưa có công việc nào trong dự án này</p>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <div className="task-header">
                      <div className="task-title-section">
                        <h4 className="task-title">{task.title}</h4>
                        <div className="task-badges">
                          <span
                            className="task-priority"
                            style={{
                              backgroundColor: getPriorityColor(task.priority),
                              color: "white",
                            }}
                          >
                            {task.priority === "HIGH"
                              ? "Cao"
                              : task.priority === "MEDIUM"
                              ? "Trung bình"
                              : "Thấp"}
                          </span>
                          <span
                            className="task-status"
                            style={{
                              backgroundColor: getStatusColor(task.status),
                              color: "white",
                            }}
                          >
                            {task.status === "TODO"
                              ? "Chưa làm"
                              : task.status === "IN_PROGRESS"
                              ? "Đang làm"
                              : "Hoàn thành"}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="TODO">Chưa làm</option>
                          <option value="IN_PROGRESS">Đang làm</option>
                          <option value="DONE">Hoàn thành</option>
                        </select>
                      </div>
                    </div>

                    {task.description && (
                      <div className="task-description">{task.description}</div>
                    )}

                    <div className="task-meta">
                      {task.assignedTo && (
                        <span className="task-assigned">👤 {task.assignedTo}</span>
                      )}
                      {task.dueDate && (
                        <span className="task-due-date">📅 {task.dueDate}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

CreateProjectModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onProjectCreated: PropTypes.func.isRequired,
};

TaskManagementModal.propTypes = {
  project: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onTaskUpdated: PropTypes.func.isRequired,
};
