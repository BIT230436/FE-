import { useEffect, useState } from "react";
import { getPendingCVs } from "../../services/cvService";
import StatusBadge from "../../components/common/StatusBadge";
import ReviewModal from "./ReviewModal";
import "./DocQueue.css";

export default function DocQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  async function load() {
    setLoading(true);
    // Chỉ lấy CV chờ duyệt, không lấy documents
    const cvList = await getPendingCVs();
    
    // Lọc chỉ lấy CV có status PENDING
    const filteredCVs = cvList.filter(cv => cv.status === 'PENDING');
    
    // Map CV thành format hiển thị
    const combinedItems = filteredCVs.map(cv => ({
      id: cv.id,
      type: 'CV',
      fileName: cv.fileName,
      uploadedAt: cv.uploadedAt,
      status: cv.status,
      note: '',
      userEmail: cv.userEmail,
      isCV: true,
      storagePath: cv.storagePath,
      internName: cv.internName,
      university: cv.university,
      phone: cv.phone
    }));
    
    setItems(combinedItems);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const handleReview = (document, action) => {
    setReviewing({ ...document, action });
  };

  const handleReviewed = () => {
    setReviewing(null);
    load(); // Reload danh sách sau khi duyệt
  };



  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 12 }}>Hồ sơ chờ duyệt</h1>
      <div className="card">
        <table className="table" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th className="table-th">Tài liệu</th>
              <th className="table-th">Tên file</th>
              <th className="table-th">Ngày nộp</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Ghi chú</th>
              <th className="table-th" style={{ width: 200 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="loading">Đang tải…</td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="empty">Không có hồ sơ chờ duyệt.</td>
              </tr>
            )}
            {items.map((d) => (
              <tr key={d.id}>
                <td className="table-td">{d.type}</td>
                <td className="table-td">
                  {d.storagePath ? (
                    <a href={d.storagePath} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                      {d.fileName}
                    </a>
                  ) : (
                    d.fileName
                  )}
                </td>
                <td className="table-td">{new Date(d.uploadedAt).toLocaleDateString()}</td>
                <td className="table-td">
                  <StatusBadge status={d.status} />
                </td>
                <td className="table-td">{d.note || "-"}</td>
                <td className="table-td">
                  <button onClick={() => handleReview(d, "APPROVE")} className="btn btn-success" style={{ marginRight: 8 }}>
                    Duyệt
                  </button>
                  <button onClick={() => handleReview(d, "REJECT")} className="btn btn-outline-danger">
                    Từ chối
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reviewing && (
        <ReviewModal
          document={reviewing}
          action={reviewing.action}
          onClose={() => setReviewing(null)}
          onReviewed={handleReviewed}
        />
      )}
    </div>
  );
}
