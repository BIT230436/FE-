import { useEffect, useState } from "react";
import { getAllContracts } from "../../services/documentService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./ContractList.css";

export default function AllContracts() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);

  // 🧮 Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // mỗi trang 10 dòng

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAllContracts();
      console.log("📄 Danh sách hợp đồng:", res);
      setContracts(res || []);
      setCurrentPage(1); // reset về trang đầu mỗi lần reload
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

  // 🧩 Xử lý phân trang
  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentContracts = contracts.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

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
                {currentContracts.map((c, idx) => {
                  const fileUrl =
                    c.file_url && c.file_url !== "-" ? c.file_url : null;
                  const fileName =
                    c.file_name && c.file_name !== "-"
                      ? decodeURIComponent(c.file_name)
                      : "-";

                  return (
                    <tr key={idx}>
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

            {/* 🧭 Điều hướng phân trang */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: currentPage === 1 ? "#eee" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                ◀ Trang trước
              </button>

              <span>
                Trang {currentPage} / {totalPages || 1}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: currentPage === totalPages ? "#eee" : "white",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Trang sau ▶
              </button>
            </div>
          </>
        )}

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={load}
            style={{
              background: "#007bff",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            🔄 Làm mới
          </button>
        </div>
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
