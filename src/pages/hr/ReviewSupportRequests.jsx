// src/pages/hr/ReviewSupportRequests.jsx
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAllSupportRequests } from "../../services/supportRequestService";
import SupportRequestReviewModal from "../../components/hr/SupportRequestReviewModal";
import InternSelectionModal from "../../components/common/InternSelectionModal"; // Để lọc theo intern
// Import CSS (đảm bảo đường dẫn đúng)
import "./ReviewSupportRequests.css";
// Tái sử dụng badge từ student component nếu phù hợp
import RequestStatusBadge from "../internships/SupportRequests"; // Giả sử component badge nằm ở đây

// Helper (Tái sử dụng)
const getRequestTypeLabel = (typeValue) => {
  const typeMap = {
    CERTIFICATE: "Giấy chứng nhận",
    DOCUMENT_SIGN: "Ký/Đóng dấu",
    INFO_UPDATE: "Cập nhật thông tin",
    OTHER: "Khác",
  };
  return typeMap[typeValue] || typeValue;
};

export default function ReviewSupportRequests() {
  const [requests, setRequests] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingRequest, setViewingRequest] = useState(null); // Request đang xem/duyệt

  // Filters state
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [filterInternName, setFilterInternName] = useState(""); // Lưu tên intern đã chọn

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      // Build filters object based on state
      const filters = {};
      if (filterStatus !== "ALL") filters.status = filterStatus;
      if (filterType !== "ALL") filters.type = filterType;
      if (filterInternName) filters.internName = filterInternName;

      const data = await getAllSupportRequests(filters);
      
      // Ensure data is an array before setting it to state
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        console.error('Expected an array of requests but got:', data);
        setRequests([]);
        setError("Dữ liệu nhận được không đúng định dạng");
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      }
    } catch (err) {
      console.error('Error loading support requests:', err);
      setError(err.message || "Không thể tải danh sách yêu cầu.");
      toast.error(err.message || "Không thể tải danh sách yêu cầu.");
      setRequests([]); // Ensure requests is always an array
    } finally {
      setLoading(false);
    }
  };

  // Load requests on initial mount and when filters change
  useEffect(() => {
    loadRequests();
  }, [filterStatus, filterType, filterInternName]);

  const handleReviewSuccess = () => {
    loadRequests(); // Tải lại danh sách sau khi duyệt thành công
  };

  const clearFilters = () => {
    setFilterStatus("ALL");
    setFilterType("ALL");
    setFilterInternName("");
  };

  return (
    <div className="review-requests-container">
      <div className="page-header">
        <h1 className="page-title">Duyệt Yêu Cầu Hỗ Trợ</h1>
        {/* Nút làm mới (tùy chọn) */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={loadRequests}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "🔄 Làm mới"}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter Bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <label htmlFor="internFilter">Lọc theo tên thực tập sinh:</label>
          <input
            id="internFilter"
            type="text"
            className="filter-input"
            placeholder="Nhập tên..."
            value={filterInternName}
            onChange={(e) => setFilterInternName(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="typeFilter">Loại yêu cầu:</label>
          <select
            id="typeFilter"
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Tất cả loại</option>
            <option value="CERTIFICATE">Giấy chứng nhận</option>
            <option value="DOCUMENT_SIGN">Ký/Đóng dấu</option>
            <option value="INFO_UPDATE">Cập nhật thông tin</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="statusFilter">Trạng thái:</label>
          <select
            id="statusFilter"
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="PROCESSING">Đang xử lý</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="REJECTED">Bị từ chối</option>
          </select>
        </div>
        <button
          className="btn btn-outline"
          onClick={clearFilters}
          style={{ alignSelf: "flex-end", height: "38px" }}
        >
          Xóa bộ lọc
        </button>
      </div>

      {/* Request List Table */}
      <div className="request-list-container">
        <table className="request-table">
          <thead>
            <tr>
              <th>TTS</th>
              <th>Loại YC</th>
              <th>Mô tả</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>File</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading">
                  Đang tải...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-requests">
                  Không có yêu cầu nào phù hợp.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.internName || "N/A"}</td>
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
                  <td>
                    {req.attachmentUrl ? (
                      <a
                        href={req.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        Xem
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setViewingRequest(req)}
                    >
                      Xem/Duyệt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* TODO: Add Pagination if needed */}
      </div>

      {/* Review Modal */}
      {viewingRequest && (
        <SupportRequestReviewModal
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}

// // Giả sử bạn có component RequestStatusBadge ở một nơi khác hoặc định nghĩa lại ở đây
// // Ví dụ định nghĩa lại (nếu chưa có sẵn):
// function RequestStatusBadge({ status }) {
//   let config = {
//     text: status || "Unknown",
//     className: "status-default",
//     icon: "❓",
//   };
//   switch (status) {
//     case "PENDING":
//       config = { text: "Chờ xử lý", className: "status-pending", icon: "⏳" };
//       break;
//     case "PROCESSING":
//       config = {
//         text: "Đang xử lý",
//         className: "status-processing",
//         icon: "🔄",
//       };
//       break;
//     case "COMPLETED":
//       config = {
//         text: "Hoàn thành",
//         className: "status-completed",
//         icon: "✅",
//       };
//       break;
//     case "REJECTED":
//       config = { text: "Bị từ chối", className: "status-rejected", icon: "❌" };
//       break;
//   }
//   return (
//     <span className={`status-badge ${config.className}`}>
//       <span className="icon">{config.icon}</span> {config.text}
//     </span>
//   );
// }
// RequestStatusBadge.propTypes = {
//   status: PropTypes.string,
// };
