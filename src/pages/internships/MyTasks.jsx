import { useEffect, useState } from "react";
import { getMyTasks, updateTaskStatus } from "../../services/taskService";
import { toast } from "react-toastify";
import "./MyTasks.css";

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await getMyTasks();
      setTasks(data);
    } catch (error) {
      toast.error("Không thể tải danh sách công việc.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(true);
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Cập nhật trạng thái thành công!");
      // cập nhật UI ngay
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái công việc.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

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
              <th>Trạng thái</th>
              <th>Hạn chót</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.description}</td>
                <td>
                  <span
                    className={`status ${
                      task.status === "DONE"
                        ? "done"
                        : task.status === "IN_PROGRESS"
                        ? "progress"
                        : "pending"
                    }`}
                  >
                    {task.status === "DONE"
                      ? "Hoàn thành"
                      : task.status === "IN_PROGRESS"
                      ? "Đang thực hiện"
                      : "Chưa bắt đầu"}
                  </span>
                </td>
                <td>{task.deadline}</td>
                <td>
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value)
                    }
                    disabled={updating}
                  >
                    <option value="PENDING">Chưa bắt đầu</option>
                    <option value="IN_PROGRESS">Đang thực hiện</option>
                    <option value="DONE">Hoàn thành</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
