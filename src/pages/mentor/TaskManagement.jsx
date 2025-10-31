import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import InternSelectionModal from "../../components/common/InternSelectionModal";
import { assignTask, getAssignedTasks } from "../../services/taskService";
import "./TaskManagement.css";

// import vi locale if you want month names in Vietnamese
import 'dayjs/locale/vi';
dayjs.locale('vi');

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    priority: "",
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
      console.log("DEBUG: raw assigned tasks from API:", data);

      // Normalize each task object so the rest of the component can rely on a single shape
      const normalized = (data || []).map((t) => {
        // try common variants for fields
        const id = t.id || t.taskId || t.task_id;
        const title = t.title || t.name || "";
        const description = t.description || t.desc || "";
        // possible date fields
        const duedate =
          t.duedate ||
          t.due_date ||
          t.due ||
          (t.schedule && (t.schedule.date || t.schedule.dateTime)) ||
          null;
        const assignedAt =
          t.assignedAt ||
          t.assigned_at ||
          t.createdAt ||
          t.created_at ||
          t.assignedAtTime ||
          null;
        const internName =
          t.internName ||
          t.intern_name ||
          (t.intern && (t.intern.fullname || t.intern.name)) ||
          (t.assignedTo && (t.assignedTo.fullname || t.assignedTo.name)) ||
          "";
        const internEmail =
          t.internEmail ||
          t.intern_email ||
          (t.intern && (t.intern.email || t.internEmail)) ||
          "";
        const status = t.status || t.state || "UNKNOWN";
        const priority = t.priority || t.prio || null;

        return {
          raw: t,
          id,
          title,
          description,
          duedate,
          assignedAt,
          internName,
          internEmail,
          status,
          priority,
        };
      });

      setTasks(normalized);
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
      !formData.due_date ||
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
        due_date: "",
        internId: "",
        priority: "",
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

  // Robust date formatter: accepts multiple input formats and returns friendly string or '-'
  const formatDate = (dateInput) => {
    if (!dateInput) return "-";

    // if the backend already sent an object (unlikely) try to handle
    if (typeof dateInput === "object" && dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) return "-";
      return dateInput.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Try dayjs parsing with several accepted formats
    const candidates = [
      dateInput, // e.g. "2025-10-31" or "2025-10-31T14:30"
      // maybe backend sends "/Date(...)/" or ISO variants - dayjs usually handles ISO
    ];

    for (const c of candidates) {
      const d = dayjs(c);
      if (d.isValid()) {
        // show e.g. "31 tháng 10, 2025" or "31/10/2025"
        try {
          return d.format("D MMMM, YYYY"); // "31 tháng 10, 2025" in vi locale
        } catch (e) {
          return d.format("DD/MM/YYYY");
        }
      }
    }

    // fallback: try native Date
    const native = new Date(dateInput);
    if (!isNaN(native.getTime())) {
      return native.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // if nothing works, show raw string so you can inspect it
    return String(dateInput);
  };

  // ✅ Gộp cả kiểm tra Overdue vào đây, không đổi UI
  const getStatusBadge = (task) => {
    // Kiểm tra nếu task quá hạn
    const due = new Date(task.duedate || task.dueDate);
    const now = new Date();
    let effectiveStatus = task.status;

    if (
      task.status !== "COMPLETED" &&
      due instanceof Date &&
      !isNaN(due.getTime()) &&
      due < now
    ) {
      effectiveStatus = "OVERDUE";
    }

    // Map theo class CSS sẵn có
    const statusMap = {
      PENDING: { class: "status-pending", label: "Chờ xử lý" },
      NEW: { class: "status-pending", label: "NEW" },
      IN_PROGRESS: { class: "status-in-progress", label: "Đang thực hiện" },
      COMPLETED: { class: "status-completed", label: "Đã hoàn thành" },
      OVERDUE: { class: "status-overdue", label: "Overdue" }, // ✅ hiển thị tiếng Anh
    };

    const statusInfo = statusMap[effectiveStatus] || {
      class: "status-default",
      label: effectiveStatus || "-",
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
      due_date: "",
      priority: "",
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
                  <label htmlFor="priority">Độ ưu tiên</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority || ""}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value="">-- Chọn độ ưu tiên --</option>
                    <option value="1">1 - Cao</option>
                    <option value="2">2 - Trung bình</option>
                    <option value="3">3 - Thấp</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Hạn chót</label>
                  <DatePicker
                    showTime
                    format="DD/MM/YYYY HH:mm"
                    className="date-picker"
                    placeholder="Chọn thời hạn"
                    value={formData.due_date ? dayjs(formData.due_date) : null}
                    onChange={(date, dateString) => {
                      setFormData((prev) => ({
                        ...prev,
                        due_date: date ? date.format("YYYY-MM-DDTHH:mm") : "",
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
                  <td>{formatDate(task.duedate)}</td>
                  <td>{getStatusBadge(task)}</td>
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
