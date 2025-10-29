// src/components/students/NewRequestModal.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { createSupportRequest } from "../../services/supportRequestService";

const REQUEST_TYPES = [
  { value: "CERTIFICATE", label: "Yêu cầu cấp giấy chứng nhận thực tập" },
  { value: "DOCUMENT_SIGN", label: "Yêu cầu ký/đóng dấu tài liệu" },
  { value: "INFO_UPDATE", label: "Yêu cầu cập nhật thông tin cá nhân" },
  { value: "OTHER", label: "Yêu cầu khác" },
];

export default function NewRequestModal({ onClose, onSuccess }) {
  const [type, setType] = useState(REQUEST_TYPES[0].value);
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // Optional: Add file size/type validation here
    if (file && file.size > 5 * 1024 * 1024) {
      // Max 5MB example
      toast.error("Kích thước file không được vượt quá 5MB.");
      e.target.value = null; // Clear the input
      setAttachment(null);
      return;
    }
    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Vui lòng nhập mô tả chi tiết cho yêu cầu.");
      return;
    }

    setLoading(true);
    try {
      const response = await createSupportRequest({
        type,
        description,
        attachment,
      });
      if (response.success) {
        toast.success(response.message || "Gửi yêu cầu thành công!");
        onSuccess(); // Callback để load lại danh sách
        onClose(); // Đóng modal
      } else {
        toast.error(response.message || "Gửi yêu cầu thất bại.");
      }
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Tạo yêu cầu hỗ trợ mới</h2>
          <button onClick={onClose} className="modal-close-btn">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="requestType" className="form-label">
              Loại yêu cầu *
            </label>
            <select
              id="requestType"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              {REQUEST_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Mô tả chi tiết *
            </label>
            <textarea
              id="description"
              className="form-control"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả rõ yêu cầu của bạn..."
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="attachment" className="form-label">
              File đính kèm (nếu có)
            </label>
            <input
              type="file"
              id="attachment"
              className="form-control"
              onChange={handleFileChange}
            />
            {attachment && (
              <p className="file-info">Đã chọn: {attachment.name}</p>
            )}
            <small className="form-text text-muted">
              Tối đa 5MB. Định dạng: PDF, DOCX, PNG, JPG.
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

NewRequestModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
