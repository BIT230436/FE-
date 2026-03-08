
import { useEffect, useState } from "react";
import { getAllContracts } from "../../services/documentService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./ContractList.css";

export default function AllContracts() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllContracts();
      console.log("📄 Danh sách hợp đồng:", res);
      setContracts(res || []);
    } catch (e) {
      console.error("❌ Lỗi tải hợp đồng:", e);
      const msg = e?.response?.data || e.message || "Không thể tải hợp đồng.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [contracts]);

  // Pagination calc
  const totalItems = contracts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = contracts.slice(startIndex, startIndex + pageSize);

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
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 12, fontWeight: "bold", fontSize: "28px" }}>
        Tất cả hợp đồng
      </h1>

      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
        {loading && <div>Đang tải dữ liệu…</div>}

        {!loading && contracts.length === 0 && (
          <div>⚠️ Không có hợp đồng nào.</div>
        )}

        {!loading && contracts.length > 0 && (
          <>
            <table
              border="1"
              cellPadding="8"
              cellSpacing="0"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th>Tên Intern</th>
                  <th>Tên HR</th>
                  <th>Tên file</th>
                  <th>Chi tiết file</th>
                  <th>Trạng thái</th>
                  <th>Ngày Upload</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((c, idx) => {
                  const fileUrl =
                    c.file_url && c.file_url !== "-" ? c.file_url : null;
                  const fileName =
                    c.file_name && c.file_name !== "-"
                      ? decodeURIComponent(c.file_name)
                      : "-";

                  return (
                    <tr key={`${c.intern_name}-${c.uploaded_at}-${idx}`}>
                      <td>{c.intern_name || "N/A"}</td>
                      <td>{c.hr_name || "N/A"}</td>
                      <td>{fileName}</td>
                      <td>
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {fileName}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{c.status || "-"}</td>
                      <td>
                        {c.uploaded_at
                          ? new Date(c.uploaded_at).toLocaleString()
                          : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
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
          </>
        )}
      </div>
    </div>
  );
}
