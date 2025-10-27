import { useEffect, useState } from "react";
import {
  getDocUrlsByIntern,
  acceptDocument,
} from "../../services/documentService";
import { useAuthStore } from "../../store/authStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyContract.css";

export default function MyContract() {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const user = useAuthStore((state) => state.user);
  const internId = user?.internId || user?.id;

  const load = async () => {
    try {
      setLoading(true);

      if (!internId) {
        toast.error("Không tìm thấy ID thực tập sinh.");
        return;
      }

      const res = await getDocUrlsByIntern(internId);
      console.log("📄 Dữ liệu hợp đồng:", res);
      setContract(res || null);
    } catch (e) {
      console.error("❌ Lỗi tải hợp đồng:", e);
      const msg = e?.response?.data || e.message || "Không thể tải hợp đồng.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (internId) load();
  }, [internId]);

  const handleConfirmContract = async () => {
    // ✅ Thay đổi: Kiểm tra document_id hoặc id
    const documentId = contract?.document_id || contract?.id;

    if (!documentId) {
      toast.error("Không tìm thấy mã hợp đồng để xác nhận.");
      return;
    }

    try {
      setConfirming(true);

      // ✅ Thay đổi: Gọi acceptDocument với đúng tham số
      const result = await acceptDocument(documentId, user.id);

      console.log("✅ API response:", result);

      toast.success("✅ Hợp đồng đã được xác nhận thành công.");

      // Cập nhật trạng thái frontend
      setContract((prev) => ({
        ...prev,
        status: "ACCEPTED",
      }));
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        e.message ||
        "❌ Xác nhận thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: 12 }}>
        Hợp đồng của tôi
      </h1>

      <div className="card" style={{ padding: 16 }}>
        {loading && <div className="loading">Đang tải dữ liệu…</div>}

        {!loading && !contract && (
          <div className="empty">⚠️ Không tìm thấy hợp đồng.</div>
        )}

        {!loading && contract && (
          <div style={{ fontSize: 14 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Người phụ trách:</strong> {contract.name_hr || "Không rõ"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Trạng thái:</strong>{" "}
              {contract.status ? contract.status.toUpperCase() : "Không rõ"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Ngày tải:</strong>{" "}
              {contract.uploaded_at
                ? new Date(contract.uploaded_at).toLocaleString()
                : "-"}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>File hợp đồng:</strong>{" "}
              {contract.file_url ? (
                <a
                  href={contract.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-link"
                >
                  Xem hợp đồng
                </a>
              ) : (
                "Không có file"
              )}
            </div>

            {contract.status === "ACCEPTED" ? (
              <button
                className="btn btn-success"
                disabled
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                ✅ Đã xác nhận
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={confirming}
                onClick={handleConfirmContract}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {confirming ? "Đang xác nhận…" : "Xác nhận hợp đồng"}
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-outline" onClick={load}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* ✅ Hiển thị thông báo nổi */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
}
