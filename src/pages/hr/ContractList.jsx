import { useEffect, useState } from "react";
import { getAllContracts } from "../../services/documentService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ContractList.css";

export default function AllContracts() {
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);

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

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: 12 }}>
        Tất cả hợp đồng
      </h1>

      <div className="card" style={{ padding: 16 }}>
        {loading && <div className="loading">Đang tải dữ liệu…</div>}

        {!loading && contracts.length === 0 && (
          <div className="empty">⚠️ Không có hợp đồng nào.</div>
        )}

        {!loading && contracts.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Tên Intern</th>
                <th>Tên HR</th>
                <th>Tên file</th>
                <th>Chi tiết file</th>
                <th>Trạng thái</th>
                <th>Ngày Upload</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c, idx) => {
                return (
                  <tr key={idx}>
                    <td>{c.internName || "N/A"}</td>
                    <td>{c.hrName || "N/A"}</td>

                    {/* Tên file: chỉ hiện chữ, không click */}
                    <td>{c.fileName || "-"}</td>

                    {/* Chi tiết file: có thể click mở link */}
                    <td>
                      {c.fileDetail ? (
                        <a
                          href={c.fileDetail}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {c.fileDetail.split("/").pop()}{" "}
                          {/* chỉ hiển thị tên file, VD: abc123.pdf */}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>{c.status || "-"}</td>
                    <td>
                      {c.uploadedAt
                        ? new Date(c.uploadedAt).toLocaleString()
                        : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-outline" onClick={load}>
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
