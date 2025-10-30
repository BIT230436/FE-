// src/pages/students/SupportRequests.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMySupportRequests } from "../../services/supportRequestService";
import NewRequestModal from "../../components/common/NewRequestModal";
import "./SupportRequests.css";

// Component Status Badge
function RequestStatusBadge({ status }) {
  let config = {
    text: status || "Unknown",
    className: "status-default",
    icon: "❓",
  };
  switch (status) {
    case "PENDING":
      config = { text: "Chờ xử lý", className: "status-pending", icon: "⏳" };
      break;
    case "COMPLETED":
      config = {
        text: "Complete",
        className: "status-completed",
        icon: "✅",
      };
      break;
    case "REJECTED":
      config = { text: "Bị từ chối", className: "status-rejected", icon: "❌" };
      break;
  }
  return (
    <span className={`status-badge ${config.className}`}>
      <span className="icon">{config.icon}</span> {config.text}
    </span>
  );
}

// Helper để lấy label cho priority
const getPriorityLabel = (priority) => {
  const priorityMap = {
    NORMAL: "Bình thường",
    HIGH: "Cao",
    URGENT: "Khẩn cấp",
  };
  return priorityMap[priority] || priority;
};

export default function SupportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMySupportRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách yêu cầu.");
      toast.error(err.message || "Không thể tải danh sách yêu cầu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRequestCreated = () => {
    loadRequests();
    toast.success("Tạo yêu cầu thành công!");
  };

  // Filter trên client-side
  const filteredRequests = requests.filter((req) => {
    if (filterStatus === "ALL") return true;
    return req.status === filterStatus;
  });

  return (
    <div className="support-requests-container">
      <div className="page-header">
        <h1 className="page-title">📬 Yêu cầu hỗ trợ của tôi</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Tạo yêu cầu mới
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filter-controls">
        <label htmlFor="statusFilter">Lọc theo trạng thái:</label>
        <select
          id="statusFilter"
          className="filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Tất cả</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="COMPLETED">Đã xác nhận</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>
      </div>

      <div className="request-list-container">
        <table className="request-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Nội dung</th>
              <th>Độ ưu tiên</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>Phản hồi</th>
              <th>File đính kèm</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading">
                  Đang tải danh sách...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-requests">
                  {filterStatus === "ALL"
                    ? "Bạn chưa có yêu cầu nào."
                    : "Không có yêu cầu nào phù hợp."}
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id}>
                  {/* Cột 1: Tiêu đề (subject) */}
                  <td className="request-subject">
                    <strong>{req.subject}</strong>
                  </td>

                  {/* Cột 2: Nội dung (message) */}
                  <td className="request-description">
                    {req.message?.length > 100
                      ? req.message.substring(0, 100) + "..."
                      : req.message}
                  </td>

                  {/* Cột 3: Độ ưu tiên (priority) */}
                  <td>
                    <span
                      className={`priority-badge priority-${req.priority?.toLowerCase()}`}
                    >
                      {getPriorityLabel(req.priority)}
                    </span>
                  </td>

                  {/* Cột 4: Ngày gửi */}
                  <td>
                    {req.createdAt
                      ? new Date(req.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>

                  {/* Cột 5: Trạng thái */}
                  <td>
                    <RequestStatusBadge status={req.status} />
                  </td>

                  {/* Cột 6: Phản hồi (hrResponse) */}
                  <td className="request-response">
                    {req.hrResponse ? (
                      <>
                        <strong>HR:</strong> {req.hrResponse}
                      </>
                    ) : req.status === "COMPLETED" || req.status === "REJECTED" ? (
                      <i>Không có phản hồi.</i>
                    ) : (
                      <i>Chưa có phản hồi.</i>
                    )}
                  </td>

                  {/* Cột 7: File đính kèm (attachmentFileId) */}
                  <td>
                    {req.attachmentFileId ? (
                      <a
                        href={req.attachmentFileId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        Xem file
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <NewRequestModal
          onClose={() => setShowModal(false)}
          onSuccess={handleRequestCreated}
        />
      )}
    </div>
  );
}