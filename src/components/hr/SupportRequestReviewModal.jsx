import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { reviewSupportRequest } from "../../services/supportRequestService";

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

// ⭐ Helper để lấy label cho priority
const getPriorityLabel = (priority) => {
  const priorityMap = {
    NORMAL: "Bình thường",
    HIGH: "Cao",
    URGENT: "Khẩn cấp",
  };
  return priorityMap[priority] || priority;
};

// ⭐ Helper để lấy icon và style cho priority
const getPriorityBadge = (priority) => {
  const badges = {
    NORMAL: { icon: "🟢", color: "#28a745", bgColor: "#d4edda" },
    HIGH: { icon: "🟡", color: "#ffc107", bgColor: "#fff3cd" },
    URGENT: { icon: "🔴", color: "#dc3545", bgColor: "#f8d7da" },
  };
  return badges[priority] || badges.NORMAL;
};

export default function SupportRequestReviewModal({
  request,
  onClose,
  onSuccess,
}) {
  const [response, setResponse] = useState(request.hrResponse || request.response || "");
  const [status, setStatus] = useState(request.status);
  const [loading, setLoading] = useState(false);

  const canReview =
    request.status === "PENDING" || request.status === "PROCESSING";

  const handleReview = async (newStatus) => {
    if (!canReview) return;

    if (newStatus === "REJECTED" && !response.trim()) {
      toast.error("Vui lòng nhập lý do từ chối vào ô phản hồi.");
      return;
    }

    setLoading(true);
    try {
      const apiResponse = await reviewSupportRequest(request.id, {
        status: newStatus,
        response: response.trim() || null,
      });

      if (apiResponse.success) {
        toast.success(
          apiResponse.message ||
            `Đã ${
              newStatus === "COMPLETED" ? "duyệt" : "từ chối"
            } yêu cầu thành công!`
        );
        onSuccess();
        onClose();
      } else {
        toast.error(apiResponse.message || "Cập nhật thất bại.");
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Lấy badge info cho priority
  const priorityBadge = getPriorityBadge(request.priority);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box review-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Xem và duyệt yêu cầu hỗ trợ</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>

        <div className="review-details form-group">
          <dl>
            <dt>Thực tập sinh:</dt>
            <dd>
              <strong>{request.internName || "N/A"}</strong>
              {request.internEmail && (
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  {request.internEmail}
                </div>
              )}
            </dd>

            <dt>Loại yêu cầu:</dt>
            <dd>{getRequestTypeLabel(request.subject || request.type)}</dd>

            {/* ⭐ THÊM hiển thị độ ưu tiên */}
            <dt>Độ ưu tiên:</dt>
            <dd>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  backgroundColor: priorityBadge.bgColor,
                  color: priorityBadge.color,
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}
              >
                <span>{priorityBadge.icon}</span>
                <span>{getPriorityLabel(request.priority)}</span>
              </span>
            </dd>

            <dt>Ngày gửi:</dt>
            <dd>
              {request.createdAt
                ? new Date(request.createdAt).toLocaleString("vi-VN")
                : "-"}
            </dd>

            <dt>Mô tả:</dt>
            <dd className="review-description">{request.message || request.description}</dd>

            <dt>File đính kèm:</dt>
            <dd>
              {request.attachmentFileId || request.attachmentUrl ? (
                <a
                  href={request.attachmentFileId || request.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-link"
                >
                  📎 Xem file đính kèm
                </a>
              ) : (
                "Không có"
              )}
            </dd>

            <dt>Trạng thái hiện tại:</dt>
            <dd>
              <span className={`status-badge status-${request.status?.toLowerCase()}`}>
                {request.status === "PENDING" && "Chờ xử lý"}
                {request.status === "COMPLETED" && "Đã xác nhận"}
                {request.status === "REJECTED" && "Bị từ chối"}
                {request.status === "PROCESSING" && "Đang xử lý"}
              </span>
            </dd>
          </dl>
        </div>

        <div className="form-group">
          <label htmlFor="response" className="form-label">
            {canReview
              ? "Phản hồi / Ghi chú (Nếu từ chối, vui lòng ghi rõ lý do)"
              : "Phản hồi đã gửi"}
          </label>
          <textarea
            id="response"
            className="form-control"
            rows="3"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder={canReview ? "Nhập phản hồi cho thực tập sinh..." : ""}
            disabled={!canReview || loading}
          ></textarea>
          {request.hrName && (
            <p className="reviewer-info">Người xử lý: {request.hrName}</p>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Đóng
          </button>
          {canReview && (
            <>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleReview("REJECTED")}
                disabled={loading}
                style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#c82333")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
              >
                {loading ? "Đang xử lý..." : " Từ chối"}
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={() => handleReview("COMPLETED")}
                disabled={loading}
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#218838")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
              >
                {loading ? "Đang xử lý..." : " Xác Nhận"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

SupportRequestReviewModal.propTypes = {
  request: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};