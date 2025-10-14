import { useState } from "react";
import { acceptDocument, confirmApproveDocument, rejectDocument, confirmRejectDocument } from "../../services/documentService";
import { acceptCV, confirmApproveCV, rejectCV, confirmRejectCV } from "../../services/cvService";

export default function NewReviewModal({ document, onClose, onReviewed }) {
  const [action, setAction] = useState(""); // "", "ACCEPT", "REJECT", "CONFIRM_APPROVE", "CONFIRM_REJECT"
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isCV = document.isCV || document.document_type === 'CV';
  const isAccepting = document.status === 'ACCEPTING';
  const isRejecting = document.status === 'REJECTING';
  const isPending = document.status === 'PENDING';

  const handleSubmit = async () => {
    if (!action) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      let response;
      
      if (isCV) {
        // CV flow
        switch (action) {
          case "ACCEPT":
            response = await acceptCV(document.id);
            break;
          case "CONFIRM_APPROVE":
            response = await confirmApproveCV(document.id);
            break;
          case "REJECT":
            response = await rejectCV(document.id, reason);
            break;
          case "CONFIRM_REJECT":
            response = await confirmRejectCV(document.id, reason);
            break;
          default:
            throw new Error("Invalid action");
        }
      } else {
        // Document flow
        switch (action) {
          case "ACCEPT":
            response = await acceptDocument(document.id);
            break;
          case "CONFIRM_APPROVE":
            response = await confirmApproveDocument(document.id, note);
            break;
          case "REJECT":
            response = await rejectDocument(document.id, reason);
            break;
          case "CONFIRM_REJECT":
            response = await confirmRejectDocument(document.id, reason);
            break;
          default:
            throw new Error("Invalid action");
        }
      }

      if (response.data.success) {
        setMessage(response.data.message);
        // Call onReviewed to refresh the list
        if (onReviewed) {
          onReviewed();
        }
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(response.data.message || "Có lỗi xảy ra");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNextAction = () => {
    if (isAccepting) return "CONFIRM_APPROVE";
    if (isRejecting) return "CONFIRM_REJECT";
    if (isPending) {
      if (action === "ACCEPT") return "CONFIRM_APPROVE";
      if (action === "REJECT") return "CONFIRM_REJECT";
    }
    return action;
  };

  const renderContent = () => {
    if (isAccepting) {
      return (
        <div>
          <h3 className="text-lg font-semibold text-yellow-600 mb-4">
            ⏳ Xác nhận duyệt {isCV ? 'CV' : 'tài liệu'}
          </h3>
          <p className="mb-4">
            {isCV ? 'CV' : 'Tài liệu'} này đã được đánh dấu duyệt. Bạn có chắc chắn muốn duyệt không?
          </p>
          {!isCV && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Ghi chú (tùy chọn):</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Thêm ghi chú cho người dùng..."
              />
            </div>
          )}
        </div>
      );
    }

    if (isRejecting) {
      return (
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-4">
            ⏳ Xác nhận từ chối {isCV ? 'CV' : 'tài liệu'}
          </h3>
          <p className="mb-4">
            {isCV ? 'CV' : 'Tài liệu'} này đã được đánh dấu từ chối. Vui lòng nhập lý do từ chối:
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Lý do từ chối:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Nhập lý do từ chối..."
              required
            />
          </div>
        </div>
      );
    }

    if (isPending) {
      return (
        <div>
          <h3 className="text-lg font-semibold text-blue-600 mb-4">
            🔍 Duyệt {isCV ? 'CV' : 'tài liệu'}
          </h3>
          <p className="mb-4">
            Bạn muốn làm gì với {isCV ? 'CV' : 'tài liệu'} này?
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setAction("ACCEPT")}
              className={`w-full p-3 text-left rounded ${
                action === "ACCEPT" 
                  ? "bg-green-100 border-2 border-green-500" 
                  : "bg-gray-50 border border-gray-300"
              }`}
            >
              ✅ Duyệt {isCV ? 'CV' : 'tài liệu'}
            </button>
            <button
              onClick={() => setAction("REJECT")}
              className={`w-full p-3 text-left rounded ${
                action === "REJECT" 
                  ? "bg-red-100 border-2 border-red-500" 
                  : "bg-gray-50 border border-gray-300"
              }`}
            >
              ❌ Từ chối {isCV ? 'CV' : 'tài liệu'}
            </button>
          </div>
          
          {action === "REJECT" && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Lý do từ chối:</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded"
                rows="3"
                placeholder="Nhập lý do từ chối..."
                required
              />
            </div>
          )}
        </div>
      );
    }

    return <div>Trạng thái không hợp lệ</div>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {renderContent()}
        
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          {(isAccepting || isRejecting || (isPending && action)) && (
            <button
              onClick={handleSubmit}
              disabled={loading || (action === "REJECT" && !reason.trim())}
              className={`flex-1 py-2 px-4 rounded font-medium ${
                loading || (action === "REJECT" && !reason.trim())
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isAccepting || action === "ACCEPT"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {loading ? "Đang xử lý..." : 
               isAccepting ? "✅ Xác nhận duyệt" :
               isRejecting ? "❌ Xác nhận từ chối" :
               action === "ACCEPT" ? "✅ Duyệt" :
               action === "REJECT" ? "❌ Từ chối" : "Xử lý"}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            {message ? "Đóng" : "Hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}
