import { useEffect, useState } from "react";
import { updateTaskStatus } from "../../services/taskService";
import { toast } from "react-toastify";
import api from "../../services/apiClient";
import { useAuthStore } from "../../store/authStore";
import "./MyTasks.css";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const getUserId = () => {
    const { user } = useAuthStore.getState();
    return user?.id || null;
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const userId = getUserId();

      if (!userId) {
        toast.error(
          "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
        );
        console.error("Cannot find userId in localStorage");
        setLoading(false);
        return;
      }

      console.log("Loading tasks for userId:", userId);

      const response = await api.get(`/tasks/my-tasks`, {
        params: { userId },
      });

      console.log("Tasks response:", response.data);

      if (response.data.success) {
        setTasks(response.data.data || []);
        if (response.data.data && response.data.data.length > 0) {
          toast.success(`Đã tải ${response.data.data.length} công việc`);
        } else {
          toast.info("Bạn chưa có công việc nào được giao");
        }
      } else {
        toast.error(
          response.data.message || "Không thể tải danh sách công việc."
        );
        setTasks([]);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);

      if (error.response) {
        // Server trả về error
        console.error("Error response:", error.response.data);
        toast.error(
          error.response.data.message || "Không thể tải danh sách công việc."
        );
      } else if (error.request) {
        // Request được gửi nhưng không có response
        console.error("No response:", error.request);
        toast.error("Không thể kết nối đến server.");
      } else {
        // Lỗi khác
        console.error("Error:", error.message);
        toast.error("Đã xảy ra lỗi: " + error.message);
      }

      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(true);
    try {
      console.log("Updating task:", taskId, "to status:", newStatus);

      const response = await updateTaskStatus(taskId, newStatus);

      console.log("Update response:", response);

      if (response.success) {
        toast.success("Cập nhật trạng thái thành công!");
        // Cập nhật UI ngay
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      } else {
        toast.error(response.message || "Không thể cập nhật trạng thái.");
      }
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái công việc.");
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mytasks-container">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="mytasks-container">
      <h2 className="mytasks-title">📋 Công việc của tôi</h2>

      {tasks.length === 0 ? (
        <p>Không có công việc nào được giao.</p>
      ) : (
        <table className="mytasks-table">
          <thead>
            <tr>
              <th>Tên công việc</th>
              <th>Mô tả</th>
              <th>Ưu tiên</th>
              <th>
                <span style={{ marginLeft: 12 }}>Trạng thái</span>
              </th>
              <th>Hạn chót</th>
              <th>
                <span style={{ marginLeft: 15 }}>Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>
                  <span
                    className={`priority priority-${task.priority?.toLowerCase()}`}
                  >
                    {task.priority === "HIGH"
                      ? "Cao"
                      : task.priority === "MEDIUM"
                      ? "Trung bình"
                      : "Thấp"}
                  </span>
                </td>
                <td>
                  <span
                    className={`status ${
                      task.status === "COMPLETED"
                        ? "done"
                        : task.status === "IN_PROGRESS"
                        ? "progress"
                        : "pending"
                    }`}
                  >
                    {task.status === "COMPLETED"
                      ? "Hoàn thành"
                      : task.status === "IN_PROGRESS"
                      ? "Đang thực hiện"
                      : "Chưa bắt đầu"}
                  </span>
                </td>
                <td>
                  <span className="deadline">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </span>
                </td>
                <td className="action-buttons">
                  <div className="btn-group">
                    <button
                      className={`status-btn ${
                        task.status === "NEW" ? "active" : ""
                      } ${updating ? "disabled" : ""}`}
                      onClick={() => handleStatusChange(task.id, "NEW")}
                      disabled={updating}
                      title="Chưa bắt đầu"
                    >
                      <span className="status-dot new"></span>
                    </button>
                    <button
                      className={`status-btn ${
                        task.status === "IN_PROGRESS" ? "active" : ""
                      } ${updating ? "disabled" : ""}`}
                      onClick={() => handleStatusChange(task.id, "IN_PROGRESS")}
                      disabled={updating}
                      title="Đang thực hiện"
                    >
                      <span className="status-dot in-progress"></span>
                    </button>
                    <button
                      className={`status-btn ${
                        task.status === "COMPLETED" ? "active" : ""
                      } ${updating ? "disabled" : ""}`}
                      onClick={() => handleStatusChange(task.id, "COMPLETED")}
                      disabled={updating}
                      title="Hoàn thành"
                    >
                      <span className="status-dot completed"></span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
