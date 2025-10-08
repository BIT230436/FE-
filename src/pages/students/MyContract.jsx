import { useEffect, useState } from "react";
import { getMyDocs, confirmContract } from "../../services/documentService";
import "../shared/list.css";

export default function MyContract() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contract, setContract] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const rows = await getMyDocs();
      const found = (rows || []).find(
        (d) => (d.type || "").toString().toUpperCase() === "CONTRACT"
      );
      setContract(found || null);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Lỗi tải hợp đồng của bạn"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: 12 }}>
        Hợp đồng của tôi
      </h1>

      <div className="card" style={{ padding: 16 }}>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}
        {message && (
          <div className="alert alert-success" style={{ marginBottom: 12 }}>
            {message}
          </div>
        )}

        {loading && <div className="loading">Đang tải…</div>}

        {!loading && !contract && (
          <div className="empty">
            Chưa có hợp đồng nào được tải lên cho bạn.
          </div>
        )}

        {!loading && contract && (
          <div style={{ fontSize: 14 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Trạng thái:</strong>{" "}
              {(contract.status || "").toUpperCase() === "CONFIRMED"
                ? "Đã xác nhận"
                : "Chưa xác nhận"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Tên file:</strong> {contract.fileName || "-"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Ngày tải:</strong>{" "}
              {contract.uploadedAt
                ? new Date(contract.uploadedAt).toLocaleString()
                : "-"}
            </div>
            {/* Nếu backend có URL tải/xem, hiển thị nút tại đây */}
            {/* <a className="btn btn-primary" href={contract.url} target="_blank" rel="noreferrer">Xem / Tải xuống</a> */}
            {(contract.status || "").toUpperCase() !== "CONFIRMED" && (
              <div style={{ marginTop: 12 }}>
                <button
                  className="btn btn-primary"
                  disabled={confirming}
                  onClick={async () => {
                    try {
                      setError("");
                      setMessage("");
                      setConfirming(true);
                      await confirmContract(contract.id);
                      setMessage("Đã xác nhận hợp đồng thành công.");
                      await load();
                    } catch (e) {
                      setError(
                        e?.response?.data?.message ||
                          e.message ||
                          "Xác nhận thất bại. Vui lòng thử lại."
                      );
                    } finally {
                      setConfirming(false);
                    }
                  }}
                >
                  {confirming ? "Đang xác nhận…" : "Xác nhận hợp đồng"}
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-outline" onClick={load}>
            Làm mới
          </button>
        </div>
      </div>
    </div>
  );
}
