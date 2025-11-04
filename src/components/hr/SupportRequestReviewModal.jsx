// src/components/hr/SupportRequestReviewModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { reviewSupportRequest } from "../../services/supportRequestService";

// Helper để lấy text từ type value (Tái sử dụng)
const getRequestTypeLabel = (typeValue) => {
  const typeMap = {
    CERTIFICATE: "Giấy chứng nhận",
    DOCUMENT_SIGN: "Ký/Đóng dấu tài liệu",
    INFO_UPDATE: "Cập nhật thông tin",
    OTHER: "Yêu cầu khác",
  };
  return typeMap[typeValue] || typeValue;
};

export default function SupportRequestReviewModal({
  request,
  onClose,
  onSuccess,
}) {
  const [response, setResponse] = useState(request.response || ""); // Lấy phản hồi cũ nếu có
  const [status, setStatus] = useState(request.status); // Trạng thái hiện tại
  const [loading, setLoading] = useState(false);

  // Chỉ cho phép duyệt/từ chối nếu đang PENDING hoặc PROCESSING
  const canReview =
    request.status === "PENDING" || request.status === "PROCESSING";

  const handleReview = async (newStatus) => {
    if (!canReview) return; // Không cho phép nếu đã hoàn thành/từ chối

    // Nếu từ chối, yêu cầu phải có phản hồi (lý do)
    if (newStatus === "REJECTED" && !response.trim()) {
      toast.error("Vui lòng nhập lý do từ chối vào ô phản hồi.");
      return;
    }

    setLoading(true);
    try {
      const apiResponse = await reviewSupportRequest(request.id, {
        status: newStatus,
        response: response.trim() || null, // Gửi null nếu trống
      });

      if (apiResponse.success) {
        toast.success(
          apiResponse.message ||
            `Đã ${
              newStatus === "COMPLETED" ? "duyệt" : "từ chối"
            } yêu cầu thành công!`
        );
        onSuccess(); // Load lại danh sách
        onClose(); // Đóng modal
      } else {
        toast.error(apiResponse.message || "Cập nhật thất bại.");
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

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
              {request.internName || "N/A"} ({request.internEmail || "N/A"})
            </dd>

            <dt>Loại yêu cầu:</dt>
            <dd>{getRequestTypeLabel(request.type)}</dd>

            <dt>Ngày gửi:</dt>
            <dd>
              {request.createdAt
                ? new Date(request.createdAt).toLocaleString("vi-VN")
                : "-"}
            </dd>

            <dt>Mô tả:</dt>
            <dd className="review-description">{request.description}</dd>

            <dt>File đính kèm:</dt>
            <dd>
              {request.attachmentUrl ? (
                <a
                  href={request.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-link"
                >
                  Xem file đính kèm
                </a>
              ) : (
                "Không có"
              )}
            </dd>

            <dt>Trạng thái hiện tại:</dt>
            <dd>{request.status}</dd>
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
            disabled={!canReview || loading} // Disable nếu không thể review hoặc đang loading
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
          {canReview && ( // Chỉ hiển thị nút duyệt/từ chối nếu có thể review
            <>
              <button
                type="button"
                className="btn btn-danger" // Nút Từ chối
                onClick={() => handleReview("REJECTED")}
                disabled={loading}
                style={{ backgroundColor: "#dc3545", borderColor: "#dc3545" }} // Màu đỏ
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#c82333")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
              >
                {loading ? "Đang xử lý..." : " Từ chối"}
              </button>
              <button
                type="button"
                className="btn btn-success" // Nút Duyệt
                onClick={() => handleReview("COMPLETED")}
                disabled={loading}
                style={{ backgroundColor: "#28a745", borderColor: "#28a745" }} // Màu xanh lá
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
