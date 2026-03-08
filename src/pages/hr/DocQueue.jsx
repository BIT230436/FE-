import { useEffect, useState } from "react";
import { getPendingCVs } from "../../services/cvService";
import StatusBadge from "../../components/common/StatusBadge";
import ReviewModal from "./ReviewModal";
import "./DocQueue.css";

export default function DocQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  async function load() {
    setLoading(true);
    try {
      // Chỉ lấy CV chờ duyệt, không lấy documents
      const cvList = await getPendingCVs();

      // Lọc chỉ lấy CV có status PENDING
      const filteredCVs = (Array.isArray(cvList) ? cvList : []).filter((cv) => cv.status === "PENDING");

      // Map CV thành format hiển thị
      const combinedItems = filteredCVs.map((cv) => ({
        id: cv.id,
        type: "CV",
        fileName: cv.fileName,
        uploadedAt: cv.uploadedAt,
        status: cv.status,
        note: "",
        userEmail: cv.userEmail,
        isCV: true,
        storagePath: cv.storagePath,
        internName: cv.internName,
        university: cv.university,
        phone: cv.phone,
      }));

      setItems(combinedItems);
    } catch (err) {
      console.error("Failed to load CV queue:", err);
    } finally {
      setLoading(false);
    }
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

  // Pagination calc
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const add = (n) => pages.push(n);
    add(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) add(i);
    if (right < totalPages - 1) pages.push("...");
    add(totalPages);
    return pages;
  }

  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 12 }}>
        Hồ sơ chờ duyệt
      </h1>
      <div className="card">
        <table className="table" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th className="table-th">Tài liệu</th>
              <th className="table-th">Tên file</th>
              <th className="table-th">Ngày nộp</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th" style={{ width: 200 }}>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="loading">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  Không có hồ sơ chờ duyệt.
                </td>
              </tr>
            )}
            {pageItems.map((d) => (
              <tr key={d.id}>
                <td className="table-td">{d.type}</td>
                <td className="table-td">
                  {d.storagePath ? (
                    <a
                      href={d.storagePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1976d2", textDecoration: "underline" }}
                    >
                      {d.fileName}
                    </a>
                  ) : (
                    d.fileName
                  )}
                </td>
                <td className="table-td">
                  {new Date(d.uploadedAt).toLocaleDateString()}
                </td>
                <td className="table-td">
                  <StatusBadge status={d.status} />
                </td>
                <td className="table-td">
                  <button
                    onClick={() => handleReview(d, "APPROVE")}
                    className="btn btn-duyet"
                    style={{ marginRight: 8 }}
                  >
                    Duyệt
                  </button>
                  <button
                    onClick={() => handleReview(d, "REJECT")}
                    className="btn btn-tuchoi"
                  >
                    Từ chối
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Hiển thị {totalItems === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + pageSize, totalItems)} trên {totalItems}
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ‹ Trước
              </button>

              {getPageNumbers().map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="page-dots">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`btn btn-sm page-btn ${
                      p === currentPage ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Sau ›
              </button>
            </div>
          </div>
        )}
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
