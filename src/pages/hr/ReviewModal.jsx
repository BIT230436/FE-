import { useState } from "react";
import { reviewDoc } from "../../services/documentService";
import { 
  acceptCV, 
  confirmApproveCV, 
  rejectCV, 
  confirmRejectCV 
} from "../../services/cvService";

export default function ReviewModal({ document, action, onClose, onReviewed }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sendEmail, setSendEmail] = useState(true); // Mặc định bật gửi email

  const handleSubmit = async () => {
    if (!action) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Kiểm tra nếu là CV thì dùng API CV, còn lại dùng API Document

      if (document.isCV) {
          const userEmail =
                      document.userEmail ||
                      document.intern_email ||
                      document.uploaderEmail ||
                      "intern@company.com";
        if (action === "APPROVE") {
          await acceptCV(document.id); // bước 1: ACCEPTING
          await confirmApproveCV(document.id); // bước 2: APPROVED (+ email BE)
        } else {
          const reason = note.trim();
          await rejectCV(document.id, reason); // bước 1: REJECTING
          await confirmRejectCV(document.id, reason); // bước 2: REJECTED (+ email BE)
        }
        if (action === "APPROVE") {
                    setMessage(
                      `Đã duyệt hồ sơ thành công! Email thông báo đã được gửi đến ${userEmail}`
                    );
                  } else {
                    setMessage(
                      `Đã từ chối hồ sơ thành công! Email thông báo đã được gửi đến ${userEmail}`
                    );
                  }
      } else {
        await reviewDoc(document.id, action, note.trim()); // tài liệu thường: 1 bước
      }

//       // Gửi email tự động nếu được bật
//       if (sendEmail) {
//         try {
//           // Lấy thông tin người dùng - cần cải thiện để lấy từ API thực tế
//           console.log("🧾 document data:", document);
//           const userEmail =
//             document.userEmail ||
//             document.intern_email ||
//             document.uploaderEmail ||
//             "intern@company.com";
//
//           if (action === "APPROVE") {
//             await sendApprovalEmail(userEmail, document.type, note.trim());
//             setMessage(
//               `Đã duyệt hồ sơ thành công! Email thông báo đã được gửi đến ${userEmail}`
//             );
//           } else {
//             await sendRejectionEmail(userEmail, document.type, note.trim());
//             setMessage(
//               `Đã từ chối hồ sơ thành công! Email thông báo đã được gửi đến ${userEmail}`
//             );
//           }
//         } catch (emailError) {
//           console.error("Email sending failed:", emailError);
//           setMessage(
//             `Đã ${
//               action === "APPROVE" ? "duyệt" : "từ chối"
//             } hồ sơ thành công! (Không thể gửi email tự động)`
//           );
//         }
//       } else {
//         setMessage(
//           `Đã ${action === "APPROVE" ? "duyệt" : "từ chối"} hồ sơ thành công!`
//         );
//       }

      setTimeout(() => {
        onReviewed();
      }, 2000);
    } catch (e) {
      setError(e?.response?.data?.message || "Có lỗi xảy ra khi xử lý hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "500px" }}>
        <h2 className="modal-title">
          {action === "APPROVE" ? "Duyệt hồ sơ" : "Từ chối hồ sơ"}
        </h2>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <strong>Thông tin hồ sơ:</strong>
          <div
            style={{
              marginTop: 8,
              padding: 12,
              backgroundColor: "#f8f9fa",
              borderRadius: 4,
            }}
          >
            <div>
              <strong>Tài liệu:</strong> {document.type}
            </div>
            <div>
              <strong>Tên file:</strong>{" "}
              {document.storagePath ? (
                <a href={document.storagePath} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                  {document.fileName}
                </a>
              ) : (
                document.fileName
              )}
            </div>
            <div>
              <strong>Ngày nộp:</strong>{" "}
              {new Date(document.uploadedAt).toLocaleDateString()}
            </div>
            {document.note && (
              <div>
                <strong>Ghi chú cũ:</strong> {document.note}
              </div>
            )}
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">Ghi chú (không bắt buộc)</label>
          <textarea
            className="form-input"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú hoặc lý do..."
            disabled={loading}
          />
        </div>

        {action === "APPROVE" && (
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={loading}
              />
              <span>Gửi email thông báo kết quả cho ứng viên</span>
            </label>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              Email sẽ được gửi tự động sau khi duyệt hồ sơ
            </div>
          </div>
        )}

        {action === "REJECT" && (
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                disabled={loading}
              />
              <span>Gửi email thông báo lý do từ chối cho ứng viên</span>
            </label>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              Email sẽ được gửi tự động sau khi từ chối hồ sơ
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={handleClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="button"
            className={`btn ${
              action === "APPROVE" ? "btn-primary" : "btn-outline-danger"
            }`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Đang xử lý..."
              : action === "APPROVE"
              ? "Duyệt hồ sơ"
              : "Từ chối hồ sơ"}
          </button>
        </div>

        {message && (
          <div style={{ color: "#28a745", marginTop: 8, textAlign: "center" }}>
            ✅ {message}
          </div>
        )}
        {error && (
          <div style={{ color: "#dc3545", marginTop: 8, textAlign: "center" }}>
            ❌ {error}
          </div>
        )}
      </div>
    </div>
  );
}
