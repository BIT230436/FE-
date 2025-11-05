import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LeaveApprovalPage.css";
import {
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../../services/leaveRequestService";

const { RangePicker } = DatePicker;

export default function HRLeaveApprovalPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);

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

  async function loadLeaveRequests() {
    setLoading(true);
    try {
      const response = await getAllLeaveRequests({
        page: 0,
        size: 1000,
      });
      // BE trả về { success, data, total, totalPages }
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
    // Chuyển đổi status từ tiếng Anh (BE) sang tiếng Việt
    const statusMap = {
      pending: { text: "Đang chờ", class: "badge-pending" },
      PENDING: { text: "Đang chờ", class: "badge-pending" },
      approved: { text: "Đã duyệt", class: "badge-approved" },
      APPROVED: { text: "Đã duyệt", class: "badge-approved" },
      rejected: { text: "Từ chối", class: "badge-rejected" },
      REJECTED: { text: "Từ chối", class: "badge-rejected" },
    };

    const statusInfo = statusMap[status] || {
      text: "Đang chờ", // Default nếu không tìm thấy
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
            <div className="empty-icon">📝</div>
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
                      <td className="table-td">{request.internName || "-"}</td>
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
          onConfirm={async (note) => {
            try {
              // BE endpoint: /api/leave-requests/{id}/approve-by-token
              // Body có thể để trống hoặc gửi note (nếu BE support)
              await approveLeaveRequest(showApproveModal.id, { note });
              toast.success("Đã duyệt yêu cầu nghỉ phép! ✅");
              setShowApproveModal(null);
              await loadLeaveRequests();
            } catch (error) {
              console.error("Error approving request:", error);
              toast.error(
                error?.response?.data?.message || "Duyệt yêu cầu thất bại"
              );
            }
          }}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          request={showRejectModal}
          onClose={() => setShowRejectModal(null)}
          onConfirm={async (note) => {
            try {
              // BE endpoint: /api/leave-requests/{id}/reject-by-token
              // Body: { rejectionReason: "..." }
              await rejectLeaveRequest(showRejectModal.id, { note });
              toast.success("Đã từ chối yêu cầu nghỉ phép");
              setShowRejectModal(null);
              await loadLeaveRequests();
            } catch (error) {
              console.error("Error rejecting request:", error);
              toast.error(
                error?.response?.data?.message || "Từ chối yêu cầu thất bại"
              );
            }
          }}
        />
      )}
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
            <span className="info-label">Loại nghỉ:</span>
            <span className="info-value">
              {request.leaveType === "paid"
                ? "Có phép"
                : request.leaveType === "unpaid"
                ? "Không phép"
                : request.leaveType === "sick"
                ? "Ốm đau"
                : "Khác"}
            </span>
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
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    if (note.trim().length < 10) {
      setError("Lý do phải có ít nhất 10 ký tự");
      toast.error("Lý do từ chối phải có ít nhất 10 ký tự");
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
            <span className="info-label">Loại nghỉ:</span>
            <span className="info-value">
              {request.leaveType === "paid"
                ? "Có phép"
                : request.leaveType === "unpaid"
                ? "Không phép"
                : request.leaveType === "sick"
                ? "Ốm đau"
                : "Khác"}
            </span>
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
