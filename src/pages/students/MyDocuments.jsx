import { useEffect, useState } from "react";
import { getMyDocs } from "../../services/documentService";
import StatusBadge from "../../components/common/StatusBadge";
import "../shared/list.css";

export default function MyDocuments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const rows = await getMyDocs();
      setItems(rows);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: 12 }}>Hồ sơ của tôi</h1>

      <div className="card">
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>
        )}
        <table className="table" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th className="table-th">Loại tài liệu</th>
              <th className="table-th">Tên file</th>
              <th className="table-th">Ngày nộp</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="loading">Đang tải…</td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">Chưa có tài liệu nào.</td>
              </tr>
            )}
            {items.map((d) => (
              <tr key={d.id}>
                <td className="table-td">{d.type}</td>
                <td className="table-td">{d.fileName}</td>
                <td className="table-td">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "-"}</td>
                <td className="table-td"><StatusBadge status={d.status} /></td>
                <td className="table-td">{d.note || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
