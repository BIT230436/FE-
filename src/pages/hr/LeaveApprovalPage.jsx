import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LeaveApprovalPage.css";
import { useAuthStore } from "../../store/authStore";
import {
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../../services/leaveRequestService";

const { RangePicker } = DatePicker;

export default function HRLeaveApprovalPage() {
  const { user } = useAuthStore();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);

  // ✅ STATE CHO THÔNG BÁO INLINE
  const [notification, setNotification] = useState(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  // ✅ AUTO HIDE NOTIFICATION AFTER 5 SECONDS
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  async function loadLeaveRequests() {
    setLoading(true);
    try {
      const response = await getAllLeaveRequests({
        page: 0,
        size: 1000,
      });
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error loading leave requests:", error);
      toast.error("Không thể tải danh sách yêu cầu nghỉ phép");
    } finally {
      setLoading(false);
    }
  }

  function getLeaveTypeName(type) {
    const typeMap = {
      paid: "Có phép",
      unpaid: "Không phép",
      sick: "Ốm đau",
      other: "Khác",
    };
    return typeMap[type] || type;
  }

  function getStatusBadge(status) {
    const statusMap = {
      pending: { text: "Đang chờ", class: "badge-pending" },
      PENDING: { text: "Đang chờ", class: "badge-pending" },
      approved: { text: "Đã duyệt", class: "badge-approved" },
      APPROVED: { text: "Đã duyệt", class: "badge-approved" },
      rejected: { text: "Từ chối", class: "badge-rejected" },
      REJECTED: { text: "Từ chối", class: "badge-rejected" },
    };

    const statusInfo = statusMap[status] || {
      text: "Đang chờ",
      class: "badge-pending",
    };

    return (
      <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>
    );
  }

  function calculateDays(startDate, endDate) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    return end.diff(start, "day") + 1;
  }

  // Filter logic
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = searchText
      ? req.internName?.toLowerCase().includes(searchText.toLowerCase()) ||
        req.internEmail?.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchesStatus = statusFilter
      ? req.status?.toLowerCase() === statusFilter.toLowerCase()
      : true;

    const matchesDateRange = dateRangeFilter
      ? dayjs(req.startDate).isBetween(
          dateRangeFilter[0],
          dateRangeFilter[1],
          "day",
          "[]"
        ) ||
        dayjs(req.endDate).isBetween(
          dateRangeFilter[0],
          dateRangeFilter[1],
          "day",
          "[]"
        )
      : true;

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Reset filters
  function clearFilters() {
    setSearchText("");
    setStatusFilter("");
    setDateRangeFilter(null);
  }

  // Pagination
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter, dateRangeFilter]);

  const totalItems = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredRequests.slice(startIndex, startIndex + pageSize);

  // Statistics
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status?.toLowerCase() === "pending")
      .length,
    approved: requests.filter((r) => r.status?.toLowerCase() === "approved")
      .length,
    rejected: requests.filter((r) => r.status?.toLowerCase() === "rejected")
      .length,
  };

  // ✅ HÀM DUYỆT
  async function handleApprove(request, note) {
    try {
      await approveLeaveRequest(request.id, {
        hrEmail: user?.email,
        note: note || ""
      });

      // ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG
      setNotification({
        type: 'success',
        message: `Đã duyệt yêu cầu nghỉ phép của ${request.internName}`,
        details: `Từ ${dayjs(request.startDate).format("DD/MM/YYYY")} đến ${dayjs(request.endDate).format("DD/MM/YYYY")}`
      });

      setShowApproveModal(null);
      await loadLeaveRequests();

    } catch (error) {
      console.error("Lỗi khi duyệt:", error);

      // ✅ HIỂN THỊ THÔNG BÁO LỖI
      setNotification({
        type: 'error',
        message: 'Duyệt yêu cầu thất bại',
        details: error?.response?.data?.message || error?.message || 'Vui lòng thử lại'
      });
    }
  }

  // ✅ HÀM TỪ CHỐI
  async function handleReject(request, reason) {
    if (!reason || reason.trim().length < 10) {
      setNotification({
        type: 'error',
        message: 'Lý do từ chối không hợp lệ',
        details: 'Vui lòng nhập lý do ít nhất 10 ký tự'
      });
      return;
    }

    try {
      await rejectLeaveRequest(request.id, {
        hrEmail: user?.email,
        rejectionReason: reason.trim()
      });

      // ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG
      setNotification({
        type: 'warning',
        message: `Đã từ chối yêu cầu nghỉ phép của ${request.internName}`,
        details: `Lý do: ${reason.trim()}`
      });

      setShowRejectModal(null);
      await loadLeaveRequests();

    } catch (error) {
      console.error("Lỗi khi từ chối:", error);

      // ✅ HIỂN THỊ THÔNG BÁO LỖI
      setNotification({
        type: 'error',
        message: 'Từ chối yêu cầu thất bại',
        details: error?.response?.data?.message || error?.message || 'Vui lòng thử lại'
      });
    }
  }

  if (loading) {
    return <div className="loading center">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="page-header">
        <h1 className="page-title">Duyệt nghỉ phép</h1>
      </div>

      {/* ✅ INLINE NOTIFICATION */}
      {notification && (
        <InlineNotification
          type={notification.type}
          message={notification.message}
          details={notification.details}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Statistics Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">📋</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng yêu cầu</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-pending-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value stat-pending-value">{stats.pending}</div>
            <div className="stat-label">Đang chờ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-approved-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value stat-approved-value">
              {stats.approved}
            </div>
            <div className="stat-label">Đã duyệt</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-rejected-icon">✕</div>
          <div className="stat-info">
            <div className="stat-value stat-rejected-value">
              {stats.rejected}
            </div>
            <div className="stat-label">Từ chối</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Tìm kiếm (Tên/Email)</label>
            <input
              className="form-input"
              placeholder="Nhập tên hoặc email"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="pending">Đang chờ</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Lọc theo ngày nghỉ</label>
            <RangePicker
              format="DD/MM/YYYY"
              value={dateRangeFilter}
              onChange={(dates) => setDateRangeFilter(dates)}
              className="form-date-range"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn-clear" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        {filteredRequests.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔭</div>
            <div className="empty-text">
              {requests.length === 0
                ? "Chưa có yêu cầu nghỉ phép nào"
                : "Không tìm thấy yêu cầu phù hợp"}
            </div>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-th">STT</th>
                    <th className="table-th">Thực tập sinh</th>
                    <th className="table-th">Thời gian</th>
                    <th className="table-th">Số ngày</th>
                    <th className="table-th">Lý do</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th">Ngày tạo</th>
                    <th className="table-th">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((request, index) => (
                    <tr key={request.id}>
                      <td className="table-td center">
                        {startIndex + index + 1}
                      </td>
                      <td className="table-td">
                        <strong>{request.internName || "-"}</strong>
                        {request.internEmail && (
                          <div style={{ fontSize: '0.85em', color: '#666', marginTop: '2px' }}>
                            {request.internEmail}
                          </div>
                        )}
                      </td>
                      <td className="table-td">
                        {dayjs(request.startDate).format("DD/MM/YYYY")} -{" "}
                        {dayjs(request.endDate).format("DD/MM/YYYY")}
                      </td>
                      <td className="table-td center">
                        {calculateDays(request.startDate, request.endDate)} ngày
                      </td>
                      <td className="table-td">
                        <div className="reason-text" title={request.reason}>
                          {request.reason}
                        </div>
                      </td>
                      <td className="table-td">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="table-td">
                        {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                      </td>
                      <td className="table-td">
                        {request.status?.toLowerCase() === "pending" ? (
                          <div className="action-buttons">
                            <button
                              className="btn btn-approve"
                              onClick={() => setShowApproveModal(request)}
                            >
                              Duyệt
                            </button>
                            <button
                              className="btn btn-reject"
                              onClick={() => setShowRejectModal(request)}
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">
                            {request.status?.toLowerCase() === "approved"
                              ? "Đã duyệt"
                              : "Đã từ chối"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Hiển thị {startIndex + 1}–
                  {Math.min(startIndex + pageSize, totalItems)} trên{" "}
                  {totalItems}
                </div>
                <div className="pagination-controls">
                  <button
                    className="btn btn-sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ‹ Trước
                  </button>
                  <span className="page-current">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    className="btn btn-sm"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    Sau ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <ApproveModal
          request={showApproveModal}
          onClose={() => setShowApproveModal(null)}
          onConfirm={(note) => handleApprove(showApproveModal, note)}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          request={showRejectModal}
          onClose={() => setShowRejectModal(null)}
          onConfirm={(reason) => handleReject(showRejectModal, reason)}
        />
      )}
    </div>
  );
}

// ✅ COMPONENT THÔNG BÁO INLINE
function InlineNotification({ type, message, details, onClose }) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: {
      bg: '#d1fae5',
      border: '#10b981',
      text: '#065f46'
    },
    error: {
      bg: '#fee2e2',
      border: '#ef4444',
      text: '#991b1b'
    },
    warning: {
      bg: '#fef3c7',
      border: '#f59e0b',
      text: '#92400e'
    },
    info: {
      bg: '#dbeafe',
      border: '#3b82f6',
      text: '#1e40af'
    }
  };

  const style = colors[type] || colors.info;

  return (
    <div
      style={{
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        padding: '16px 20px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div style={{ fontSize: '24px', flexShrink: 0 }}>
        {icons[type]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: '600',
          color: style.text,
          fontSize: '16px',
          marginBottom: '4px'
        }}>
          {message}
        </div>
        {details && (
          <div style={{
            color: style.text,
            fontSize: '14px',
            opacity: 0.8
          }}>
            {details}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: style.text,
          cursor: 'pointer',
          fontSize: '20px',
          padding: '0',
          lineHeight: '1',
          opacity: 0.6,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.6'}
      >
        ×
      </button>
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}

function ApproveModal({ request, onClose, onConfirm }) {
  const [note, setNote] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(note.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-approve">
        <div className="modal-header">
          <div className="modal-icon approve-icon">✓</div>
          <h2 className="modal-title">Xác nhận duyệt nghỉ phép</h2>
        </div>

        <div className="modal-content">
          <div className="info-row">
            <span className="info-label">Thực tập sinh:</span>
            <span className="info-value">{request.internName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Thời gian:</span>
            <span className="info-value">
              {dayjs(request.startDate).format("DD/MM/YYYY")} -{" "}
              {dayjs(request.endDate).format("DD/MM/YYYY")} (
              {dayjs(request.endDate).diff(dayjs(request.startDate), "day") + 1}{" "}
              ngày)
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Lý do:</span>
            <span className="info-value">{request.reason}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ghi chú (tùy chọn)</label>
            <textarea
              className="form-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú nếu có..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-approve">
              Xác nhận duyệt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RejectModal({ request, onClose, onConfirm }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!note.trim()) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }

    if (note.trim().length < 10) {
      setError("Lý do phải có ít nhất 10 ký tự");
      return;
    }

    onConfirm(note.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-reject">
        <div className="modal-header">
          <div className="modal-icon reject-icon">✕</div>
          <h2 className="modal-title">Xác nhận từ chối nghỉ phép</h2>
        </div>

        <div className="modal-content">
          <div className="info-row">
            <span className="info-label">Thực tập sinh:</span>
            <span className="info-value">{request.internName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Thời gian:</span>
            <span className="info-value">
              {dayjs(request.startDate).format("DD/MM/YYYY")} -{" "}
              {dayjs(request.endDate).format("DD/MM/YYYY")} (
              {dayjs(request.endDate).diff(dayjs(request.startDate), "day") + 1}{" "}
              ngày)
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Lý do nghỉ:</span>
            <span className="info-value">{request.reason}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Lý do từ chối <span className="required">*</span>
            </label>
            <textarea
              className={`form-textarea ${error ? "input-error" : ""}`}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setError("");
              }}
              placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)"
              rows={4}
            />
            <div className="char-count">{note.length} / 500 ký tự</div>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-reject">
              Xác nhận từ chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}