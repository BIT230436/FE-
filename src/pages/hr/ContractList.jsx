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
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 12 }}>Tất cả hợp đồng</h1>

      <div style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
        {loading && <div>Đang tải dữ liệu…</div>}

        {!loading && contracts.length === 0 && (
          <div>⚠️ Không có hợp đồng nào.</div>
        )}

        {!loading && contracts.length > 0 && (
          <table
            border="1"
            cellPadding="8"
            cellSpacing="0"
            style={{ width: "100%", borderCollapse: "collapse" }}
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
              {contracts.map((c, idx) => {
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
        )}

        <div style={{ marginTop: 16 }}>
          <button onClick={load}>🔄 Làm mới</button>
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
