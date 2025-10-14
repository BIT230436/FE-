import { useEffect, useState } from "react";
import { getMyDocs } from "../../services/documentService";
import { getMyCVs } from "../../services/cvService";
import { useAuthStore } from "../../store/authStore";
import StatusBadge from "../../components/common/StatusBadge";
import "../shared/list.css";

export default function MyDocuments() {
  const { user } = useAuthStore();
  const [cvs, setCvs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      
      // USER chỉ có CV, INTERN có cả CV và documents
      if (user?.role === "USER") {
        const cvData = await getMyCVs();
        setCvs(cvData);
        setDocuments([]);
      } else {
        const [cvData, docData] = await Promise.all([
          getMyCVs(),
          getMyDocs()
        ]);
        setCvs(cvData);
        setDocuments(docData);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: 12 }}>Hồ sơ của tôi</h1>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>
      )}

      {/* CV Section */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, fontWeight: 600 }}>📄 CV</h2>
        <table className="table" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th className="table-th">Tên file</th>
              <th className="table-th">Loại file</th>
              <th className="table-th">Ngày nộp</th>
              <th className="table-th">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="loading">Đang tải…</td>
              </tr>
            )}
            {!loading && cvs.length === 0 && (
              <tr>
                <td colSpan={4} className="empty">Chưa có CV nào.</td>
              </tr>
            )}
            {cvs.map((cv) => (
              <tr key={cv.id}>
                <td className="table-td">
                  {cv.storagePath ? (
                    <a href={cv.storagePath} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                      {cv.fileName}
                    </a>
                  ) : (
                    cv.fileName
                  )}
                </td>
                <td className="table-td">{cv.fileType}</td>
                <td className="table-td">{cv.uploadedAt ? new Date(cv.uploadedAt).toLocaleString() : "-"}</td>
                <td className="table-td"><StatusBadge status={cv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Documents Section - Chỉ hiển thị cho INTERN */}
      {user?.role === "INTERN" && (
        <div className="card">
          <h2 style={{ fontSize: 18, marginBottom: 12, fontWeight: 600 }}>📋 Hợp đồng & Tài liệu</h2>
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
                  <td colSpan={5} className="loading">Đang tải…</td>
                </tr>
              )}
              {!loading && documents.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">Chưa có tài liệu nào.</td>
                </tr>
              )}
              {documents.map((d) => (
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
      )}
    </div>
  );
}
