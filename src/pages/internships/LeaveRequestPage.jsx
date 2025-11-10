import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LeaveRequestPage.css";
import { useAuthStore } from "../../store/authStore";
import {
  getLeaveRequests,
  createLeaveRequest,
  cancelLeaveRequest,
} from "../../services/leaveRequestService";

const { RangePicker } = DatePicker;

export default function LeaveRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const currentUser = useAuthStore((state) => state.user);

  // ✅ STATE CHO THÔNG BÁO INLINE
  const [notification, setNotification] = useState(null);

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
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    console.log("=== LOADING LEAVE REQUESTS ===");
    console.log("Current user email:", currentUser.email);
    console.log("Current user ID:", currentUser.id);

    setLoading(true);
    try {
      const response = await getLeaveRequests(currentUser.email);

      console.log("Response from API:", response);

      let userRequests = Array.isArray(response.data)
        ? response.data
        : [];

      const currentEmail = currentUser.email.toLowerCase();
      userRequests = userRequests.filter(req => {
        const internEmail = (req.internEmail || '').toLowerCase();
        const match = internEmail === currentEmail;
        console.log(`Checking request ${req.id}: ${req.internEmail} === ${currentUser.email}? ${match}`);
        return match;
      });

      console.log("Final filtered requests:", userRequests);
      console.log("Total requests:", userRequests.length);

      setRequests(userRequests);
    } catch (error) {
      console.error("Error loading leave requests:", error);

      // ✅ HIỂN THỊ THÔNG BÁO LỖI
      setNotification({
        type: 'error',
        message: 'Không thể tải danh sách nghỉ phép',
        details: error?.message || 'Vui lòng thử lại sau'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelRequest(requestId) {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu này?")) return;

    try {
      await cancelLeaveRequest(requestId);

      // ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG
      setNotification({
        type: 'success',
        message: 'Đã hủy yêu cầu nghỉ phép',
        details: 'Yêu cầu của bạn đã được hủy thành công'
      });

      await loadLeaveRequests();
    } catch (error) {
      console.error("Error canceling request:", error);

      // ✅ HIỂN THỊ THÔNG BÁO LỖI
      setNotification({
        type: 'error',
        message: 'Không thể hủy yêu cầu',
        details: error?.response?.data?.message || 'Vui lòng thử lại sau'
      });
    }
  }

  // ✅ HÀM TẠO YÊU CẦU MỚI
  async function handleCreateRequest(data) {
    try {
      await createLeaveRequest(data);

      // ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG
      setNotification({
        type: 'success',
        message: 'Gửi yêu cầu nghỉ phép thành công! ',
        details: `Từ ${dayjs(data.startDate).format("DD/MM/YYYY")} đến ${dayjs(data.endDate).format("DD/MM/YYYY")}`
      });

      setShowCreate(false);
      await loadLeaveRequests();

    } catch (error) {
      console.error("Error creating leave request:", error);

      // ✅ HIỂN THỊ THÔNG BÁO LỖI
      setNotification({
        type: 'error',
        message: 'Tạo yêu cầu thất bại',
        details: error?.response?.data?.message || error?.message || 'Vui lòng kiểm tra lại thông tin'
      });
    }
  }

  function getStatusBadge(status) {
    const statusMap = {
      PENDING: { text: "Đang chờ", class: "badge-pending" },
      APPROVED: { text: "Đã duyệt", class: "badge-approved" },
      REJECTED: { text: "Từ chối", class: "badge-rejected" },
      pending: { text: "Đang chờ", class: "badge-pending" },
      approved: { text: "Đã duyệt", class: "badge-approved" },
      rejected: { text: "Từ chối", class: "badge-rejected" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
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

  // Pagination
  const totalItems = requests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = requests.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return <div className="loading center">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page-header">
        <h1 className="page-title">Đăng ký nghỉ phép</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          + Tạo yêu cầu mới
        </button>
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
        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-value">
              {requests.filter((r) => r.status === "PENDING" || r.status === "pending").length}
            </div>
            <div className="stat-label">Đang chờ</div>
          </div>
        </div>
        <div className="stat-card stat-approved">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value">
              {requests.filter((r) => r.status === "APPROVED" || r.status === "approved").length}
            </div>
            <div className="stat-label">Đã duyệt</div>
          </div>
        </div>
        <div className="stat-card stat-rejected">
          <div className="stat-icon">✕</div>
          <div className="stat-info">
            <div className="stat-value">
              {requests.filter((r) => r.status === "REJECTED" || r.status === "rejected").length}
            </div>
            <div className="stat-label">Từ chối</div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="card">
        {requests.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-text">Bạn chưa có yêu cầu nghỉ phép nào</div>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreate(true)}
            >
              Tạo yêu cầu đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-th">STT</th>
                    <th className="table-th">Thời gian</th>
                    <th className="table-th">Số ngày</th>
                    <th className="table-th">Lý do</th>
                    <th className="table-th">Trạng thái</th>
                    <th className="table-th">Lý do từ chối/duyệt</th>
                    <th className="table-th">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((request, index) => (
                    <tr key={request.id}>
                      <td className="table-td center">
                        {startIndex + index + 1}
                      </td>
                      <td className="table-td">
                        {dayjs(request.startDate).format("DD/MM/YYYY")} - {dayjs(request.endDate).format("DD/MM/YYYY")}
                      </td>
                      <td className="table-td center">
                        {request.leaveDays || calculateDays(request.startDate, request.endDate)} ngày
                      </td>
                      <td className="table-td">
                        <div className="reason-text">{request.reason}</div>
                      </td>
                      <td className="table-td">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="table-td">
                        {request.approvalReason || request.rejectionReason || '-'}
                      </td>
                      <td className="table-td">
                        {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
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

      {/* Create Leave Request Modal */}
      {showCreate && (
        <CreateLeaveRequestModal
          currentUser={currentUser}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateRequest}
        />
      )}
    </div>
  );
}

// ✅ COMPONENT THÔNG BÁO INLINE (GIỐNG HR PAGE)
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

function CreateLeaveRequestModal({ currentUser, onClose, onCreate }) {
  const [dateRange, setDateRange] = useState(null);
  const [reason, setReason] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      errors.dateRange = "Vui lòng chọn thời gian nghỉ";
    }
    if (!reason.trim()) errors.reason = "Vui lòng nhập lý do nghỉ";
    if (reason.trim().length < 10) {
      errors.reason = "Lý do phải có ít nhất 10 ký tự";
    }
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    if (!currentUser?.email) {
      toast.error("Không xác định được người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    const data = {
      email: currentUser.email,
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
      reason: reason.trim(),
    };

    onCreate(data);
  };

  const handleInputChange = (setter, field) => (value) => {
    setter(value);
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Tạo yêu cầu nghỉ phép</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Thời gian nghỉ <span className="required">*</span>
            </label>
            <RangePicker
              format="DD/MM/YYYY"
              value={dateRange}
              onChange={handleInputChange(setDateRange, "dateRange")}
              className="form-date-range"
              status={validationErrors.dateRange ? "error" : undefined}
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              disabledDate={(current) => {
                return current && current < dayjs().startOf("day");
              }}
            />
            {validationErrors.dateRange && (
              <div className="error-message">{validationErrors.dateRange}</div>
            )}
            {dateRange && dateRange[0] && dateRange[1] && (
              <div className="date-info">
                Tổng số ngày nghỉ:{" "}
                <strong>
                  {dateRange[1].diff(dateRange[0], "day") + 1} ngày
                </strong>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Lý do nghỉ <span className="required">*</span>
            </label>
            <textarea
              className={`form-textarea ${
                validationErrors.reason ? "input-error" : ""
              }`}
              value={reason}
              onChange={(e) =>
                handleInputChange(setReason, "reason")(e.target.value)
              }
              placeholder="Nhập lý do nghỉ phép của bạn (tối thiểu 10 ký tự)"
              rows={4}
            />
            <div className="char-count">{reason.length} / 500 ký tự</div>
            {validationErrors.reason && (
              <div className="error-message">{validationErrors.reason}</div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Gửi yêu cầu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}