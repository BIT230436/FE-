// src/pages/students/SupportRequests.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMySupportRequests } from "../../services/supportRequestService";
import NewRequestModal from "../../components/common/NewRequestModal";
import StatusBadge from "../../components/common/StatusBadge"; // Sử dụng lại StatusBadge nếu có
import "./SupportRequests.css";

// Helper để lấy text từ type value
const getRequestTypeLabel = (typeValue) => {
  const typeMap = {
    CERTIFICATE: "Giấy chứng nhận",
    DOCUMENT_SIGN: "Ký/Đóng dấu tài liệu",
    INFO_UPDATE: "Cập nhật thông tin",
    OTHER: "Yêu cầu khác",
  };
  return typeMap[typeValue] || typeValue;
};

// Component Status Badge nội bộ nếu chưa có
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
    case "PROCESSING":
      config = {
        text: "Đang xử lý",
        className: "status-processing",
        icon: "🔄",
      };
      break;
    case "COMPLETED":
      config = {
        text: "Hoàn thành",
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

export default function SupportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL"); // 'ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = filterStatus !== "ALL" ? { status: filterStatus } : {};
      const data = await getMySupportRequests(filters);
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
  }, [filterStatus]); // Load lại khi filter thay đổi

  const handleRequestCreated = () => {
    loadRequests(); // Load lại danh sách sau khi tạo mới thành công
    // Có thể thêm toast thông báo ở đây nếu NewRequestModal không tự làm
  };

  const filteredRequests = requests; // API đã lọc rồi

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
          <option value="PROCESSING">Đang xử lý</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>
      </div>

      <div className="request-list-container">
        <table className="request-table">
          <thead>
            <tr>
              <th>Loại yêu cầu</th>
              <th>Mô tả</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>Phản hồi</th>
              <th>File đính kèm</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading">
                  Đang tải danh sách...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-requests">
                  Bạn chưa có yêu cầu nào.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>{getRequestTypeLabel(req.type)}</td>
                  <td className="request-description">{req.description}</td>
                  <td>
                    {req.createdAt
                      ? new Date(req.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td>
                    <RequestStatusBadge status={req.status} />
                  </td>
                  <td className="request-response">
                    {req.response ? (
                      <>
                        <strong>HR:</strong> {req.response}
                      </>
                    ) : req.status === "COMPLETED" ||
                      req.status === "REJECTED" ? (
                      <i>Không có phản hồi.</i>
                    ) : (
                      <i>Chưa có phản hồi.</i>
                    )}
                  </td>
                  <td>
                    {req.attachmentUrl ? (
                      <a
                        href={req.attachmentUrl}
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
