import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import InternSelectionModal from "../../components/common/InternSelectionModal";
import { assignTask, getAssignedTasks } from "../../services/taskService";
import "./TaskManagement.css";

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    internId: "",
  });

  // Load tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getAssignedTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Không thể tải danh sách nhiệm vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setFormData((prev) => ({
      ...prev,
      internId: intern.intern_id || intern.id,
    }));
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.description ||
      !formData.deadline ||
      !formData.internId
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      await assignTask(formData);
      toast.success("Giao nhiệm vụ thành công!");
      setFormData({
        title: "",
        description: "",
        deadline: "",
        internId: "",
      });
      setSelectedIntern(null);
      loadTasks();
    } catch (error) {
      console.error("Error assigning task:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi giao nhiệm vụ"
      );
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { class: "status-pending", label: "Chờ xử lý" },
      IN_PROGRESS: { class: "status-in-progress", label: "Đang thực hiện" },
      COMPLETED: { class: "status-completed", label: "Đã hoàn thành" },
      OVERDUE: { class: "status-overdue", label: "Quá hạn" },
    };
    const statusInfo = statusMap[status] || {
      class: "status-default",
      label: status,
    };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Handle modal open/close
  const [showTaskModal, setShowTaskModal] = useState(false);

  const handleOpenTaskModal = () => {
    setShowTaskModal(true);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    // Reset form when closing
    setFormData({
      title: "",
      description: "",
      deadline: "",
      internId: "",
    });
    setSelectedIntern(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleSubmit(e);
      handleCloseTaskModal();
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  return (
    <div className="task-management">
      <div className="page-header">
        <h1>Quản lý nhiệm vụ</h1>
        <button className="btn btn-primary" onClick={handleOpenTaskModal}>
          Giao nhiệm vụ mới
        </button>
      </div>

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Giao nhiệm vụ mới</h2>
              <button className="modal-close" onClick={handleCloseTaskModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleFormSubmit} className="task-form">
                <div className="form-group">
                  <label>Chọn thực tập sinh</label>
                  <div
                    className="intern-selector"
                    onClick={() => setShowModal(true)}
                    style={{ cursor: "pointer" }}
                  >
                    {selectedIntern ? (
                      <div className="selected-intern">
                        <span>{selectedIntern.student}</span>
                        <span className="text-muted">
                          {selectedIntern.studentEmail}
                        </span>
                      </div>
                    ) : (
                      <div className="select-placeholder">
                        Nhấn để chọn thực tập sinh
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="title">Tiêu đề nhiệm vụ</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Nhập tiêu đề nhiệm vụ"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả chi tiết</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Mô tả chi tiết nhiệm vụ..."
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Hạn chót</label>
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    className="date-picker"
                    placeholder="Chọn thời hạn"
                    value={formData.deadline ? dayjs(formData.deadline) : null}
                    onChange={(date, dateString) => {
                      setFormData((prev) => ({
                        ...prev,
                        deadline: date ? date.format("YYYY-MM-DDTHH:mm") : "",
                      }));
                    }}
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseTaskModal}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Giao nhiệm vụ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="task-list-container">
        <h2>Danh sách nhiệm vụ đã giao</h2>
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : tasks.length === 0 ? (
          <div className="no-tasks">Chưa có nhiệm vụ nào được giao</div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Thực tập sinh</th>
                <th>Hạn chót</th>
                <th>Trạng thái</th>
                <th>Ngày giao</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="task-title">{task.title}</div>
                    <div className="task-description">{task.description}</div>
                  </td>
                  <td>
                    <div className="intern-info">
                      <div className="intern-name">{task.internName}</div>
                      <div className="intern-email">{task.internEmail}</div>
                    </div>
                  </td>
                  <td>{formatDate(task.deadline)}</td>
                  <td>{getStatusBadge(task.status)}</td>
                  <td>{formatDate(task.assignedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <InternSelectionModal
          onClose={() => setShowModal(false)}
          onSelect={handleSelectIntern}
        />
      )}
    </div>
  );
};

export default TaskManagement;
