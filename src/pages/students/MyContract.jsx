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
  const [notFound, setNotFound] = useState(false); // ✅ Thêm state để track 404

  const user = useAuthStore((state) => state.user);
  const internId = user?.internId || user?.id;

  const load = async () => {
    try {
      setLoading(true);
      setNotFound(false); // Reset trạng thái 404

      if (!internId) {
        console.log("❌ Không tìm thấy ID thực tập sinh");
        return;
      }

      const res = await getDocUrlsByIntern(internId);
     
      let contractData = null;

      if (Array.isArray(res)) {

        contractData = res[0] || null;
        console.log("📄 Extracted from array:", contractData);
      } else if (res && typeof res === "object") {
        // Nếu là object, kiểm tra có data/contract field không
        contractData = res.data || res.contract || res;
        console.log("📄 Extracted from object:", contractData);
      }

      console.log("📄 Final contract data:", contractData);
      setContract(contractData);

      // ✅ Nếu không có contract data (200 nhưng rỗng) → coi như chưa có hợp đồng
      if (!contractData) {
        setNotFound(true);
        console.log("ℹ️ Intern chưa có hợp đồng (200 - empty data)");
      }
    } catch (e) {
      console.error("❌ Lỗi tải hợp đồng:", e);
      console.error("❌ Error response:", e?.response);

      // ✅ Kiểm tra nếu là lỗi 404
      if (e?.response?.status === 404) {
        setNotFound(true);
        console.log("ℹ️ Intern chưa có hợp đồng (404)");
        return;
      }

      // ✅ Các lỗi khác cũng set notFound (CORS, Network, 500...)
      setNotFound(true);
      console.error(
        "❌ Lỗi khi tải hợp đồng:",
        e?.response?.status || e.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔍 User data:", user);
    console.log("🔍 Intern ID:", internId);
    if (internId) load();
  }, [internId]);

  const handleConfirmContract = async () => {
    // ✅ Kiểm tra nhiều field có thể có
    const documentId =
      contract?.document_id || contract?.id || contract?.documentId;

    if (!documentId) {
      toast.error("Không tìm thấy mã hợp đồng để xác nhận.");
      console.log("❌ Contract object:", contract);
      return;
    }

    try {
      setConfirming(true);

      const result = await acceptDocument(documentId, user.id);
      console.log("✅ API response:", result);

      toast.success("✅ Hợp đồng đã được xác nhận thành công.");

      // Cập nhật trạng thái frontend
      setContract((prev) => ({
        ...prev,
        status: "ACCEPTED",
      }));
    } catch (e) {
      console.error("❌ Accept error:", e);
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

        {/* ✅ Hiển thị giao diện đặc biệt cho 404 */}
        {!loading && notFound && (
          <div style={{ textAlign: "center", padding: "32px 16px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <h3 style={{ marginBottom: 8, color: "#666" }}>
              Thực tập sinh chưa có hợp đồng thực tập
            </h3>
            <p style={{ color: "#999", marginBottom: 24 }}>
              Vui lòng liên hệ với phòng nhân sự để được hỗ trợ.
            </p>
            <button className="btn btn-primary" onClick={load}>
              🔄 Kiểm tra lại
            </button>
          </div>
        )}

        {!loading && !contract && !notFound && (
          <div className="empty">⚠️ Không tìm thấy hợp đồng.</div>
        )}

        {!loading && contract && (
          <div style={{ fontSize: 14 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Người phụ trách:</strong>{" "}
              {contract.name_hr ||
                contract.hr_name ||
                contract.hrName ||
                "Không rõ"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Trạng thái:</strong>{" "}
              {contract.status ? contract.status.toUpperCase() : "Không rõ"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Ngày tải:</strong>{" "}
              {contract.uploaded_at || contract.uploadedAt
                ? new Date(
                    contract.uploaded_at || contract.uploadedAt
                  ).toLocaleString("vi-VN")
                : "-"}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>File hợp đồng:</strong>{" "}
              {contract.file_url || contract.fileUrl ? (
                <a
                  href={contract.file_url || contract.fileUrl}
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

        {!loading && !notFound && (
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-outline" onClick={load}>
              🔄 Làm mới
            </button>
          </div>
        )}
      </div>

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
