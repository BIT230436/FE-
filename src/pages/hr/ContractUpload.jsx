import { useEffect, useState } from "react";
import { getInterns } from "../../services/internService";
import { getDocsByIntern, uploadInternDoc, deleteDoc } from "../../services/documentService";
import "../students/profile.css";

export default function ContractUpload() {
  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [selectedInternId, setSelectedInternId] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [contractInfo, setContractInfo] = useState({
    loading: false,
    doc: null,
  });

  // Dùng API thật từ documentService

  async function loadInterns() {
    setLoadingInterns(true);
    try {
      const data = await getInterns({ size: 50 });
      // Normalize: supports {items: []} or []
      let rows = [];
      if (Array.isArray(data?.items)) {
        rows = data.items;
      } else if (Array.isArray(data)) {
        rows = data;
      }
      setInterns(rows);
      if (!selectedInternId && rows.length > 0) {
        const firstId = (rows[0].id ?? rows[0].internId)?.toString();
        setSelectedInternId(firstId);
      }
    } catch (e) {
      // show a user-friendly error but don't swallow silently
      setError("Không tải được danh sách thực tập sinh");
      // log for debugging
      // eslint-disable-next-line no-console
      console.error("loadInterns error", e);
    } finally {
      setLoadingInterns(false);
    }
  }

  useEffect(() => {
    loadInterns();
  }, []);

  // Load current contract status for selected intern
  useEffect(() => {
    async function loadContract() {
      if (!selectedInternId) {
        setContractInfo({ loading: false, doc: null });
        return;
      }
      setContractInfo({ loading: true, doc: null });
      try {
        const rows = await getDocsByIntern(selectedInternId);
        // Chuẩn hóa nếu BE trả khác cấu trúc
        const normalized = (rows || []).map((r) => ({
          id: r.document_id || r.id,
          type: (r.document_type || r.type || "").toString().toUpperCase(),
          fileName: r.file_name || r.fileName || r.file || "",
          uploadedAt: r.uploaded_at || r.uploadedAt || r.createdAt || r.created_at,
          status: r.status,
        }));
        const contract = normalized.find((d) => d.type === "CONTRACT") || null;
        setContractInfo({ loading: false, doc: contract });
      } catch (e) {
        setContractInfo({ loading: false, doc: null });
        // eslint-disable-next-line no-console
        console.error("loadContract error", e);
      }
    }
    loadContract();
  }, [selectedInternId]);

  const handleChangeIntern = (e) => {
    const newId = e.target.value;
    setSelectedInternId(newId);
    // Clear current file and messages when switching intern
    setFile(null);
    setMessage("");
    setError("");
    const input = document.getElementById("file-contract");
    if (input) input.value = "";
  };

  const handleFileChange = (f) => {
    setMessage("");
    setError("");
    if (!f) return setFile(null);
    const name = f.name.toLowerCase();
    const extOk = name.endsWith(".pdf") || name.endsWith(".docx");
    const sizeOk = f.size <= 10 * 1024 * 1024;
    if (!extOk) {
      setError("Chỉ hỗ trợ PDF hoặc DOCX");
      return;
    }
    if (!sizeOk) {
      setError("Kích thước file không được vượt quá 10MB");
      return;
    }
    setFile(f);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // (optional) could derive selected intern's display name if needed in future

  const onUpload = async () => {
    setMessage("");
    setError("");
    if (!selectedInternId) {
      setError("Vui lòng chọn thực tập sinh");
      return;
    }
    if (!file) {
      setError("Vui lòng chọn file hợp đồng (PDF, DOCX)");
      return;
    }
    try {
      setUploading(true);
      await uploadInternDoc({ internId: selectedInternId, type: "CONTRACT", file });
      setMessage("Tải lên hợp đồng thành công! Vui lòng chờ HR duyệt.");
      setFile(null);
      const input = document.getElementById("file-contract");
      if (input) input.value = "";
      // Refresh contract status
      const rows = await getDocsByIntern(selectedInternId);
      const normalized = (rows || []).map((r) => ({
        id: r.document_id || r.id,
        type: (r.document_type || r.type || "").toString().toUpperCase(),
        fileName: r.file_name || r.fileName || r.file || "",
        uploadedAt: r.uploaded_at || r.uploadedAt || r.createdAt || r.created_at,
        status: r.status,
      }));
      const contract = normalized.find((d) => d.type === "CONTRACT") || null;
      setContractInfo({ loading: false, doc: contract });
    } catch (e) {
      const backendMsg = e?.response?.data?.message;
      setError(backendMsg || "Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async () => {
    if (!contractInfo?.doc?.id) return;
    if (!confirm("Bạn có chắc muốn xóa hợp đồng này?")) return;
    try {
      setError("");
      setMessage("");
      await deleteDoc(contractInfo.doc.id);
      setMessage("Đã xóa hợp đồng.");
      setContractInfo({ loading: false, doc: null });
    } catch (e) {
      const backendMsg = e?.response?.data?.message;
      setError(backendMsg || "Xóa thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="profile-container">
      <div className="du-header">
        <h1 className="profile-title">📑 Tải lên hợp đồng thực tập</h1>
        <p className="text-muted fs-16 mt-16">
          Chỉ hỗ trợ định dạng PDF hoặc DOCX. Tối đa 10MB.
        </p>
      </div>

      <div className="upload-card upload-card--muted mb-24">
        <div>
          <label className="fw-600" htmlFor="intern-select">
            Chọn thực tập sinh
          </label>
          <div className="select-wrapper">
            <select
              id="intern-select"
              className="p-select"
              value={selectedInternId}
              onChange={handleChangeIntern}
              disabled={loadingInterns}
            >
              <option value="">-- Chọn --</option>
              {interns.map((i) => {
                const id = (i.id ?? i.internId)?.toString();
                const name = i.fullName || i.name || `Intern ${id}`;
                const email = i.email || i.username || "";
                return (
                  <option key={id} value={id}>
                    {name} {email ? `• ${email}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        {/* Contract status */}
        {selectedInternId && (
          <div className="du-alert" style={{ marginTop: 12 }}>
            {contractInfo.loading ? (
              <span>Đang tải trạng thái hợp đồng…</span>
            ) : contractInfo.doc ? (
              <div>
                <div>
                  <strong>Trạng thái:</strong> Đã upload
                </div>
                <div>
                  <strong>Tên file:</strong>{" "}
                  {contractInfo.doc.fileName || "(không rõ)"}
                </div>
                <div>
                  <strong>Ngày tải:</strong>{" "}
                  {contractInfo.doc.uploadedAt
                    ? new Date(contractInfo.doc.uploadedAt).toLocaleString()
                    : "-"}
                </div>
                <div className="du-actions" style={{ marginTop: 8 }}>
                  <button
                    className="p-btn p-btn-primary"
                    onClick={onUpload}
                    disabled={!file || uploading}
                  >
                    {uploading ? "Đang tải lên..." : "Thay thế hợp đồng"}
                  </button>
                  <button
                    className="p-btn p-btn-outline-danger"
                    onClick={onDelete}
                    style={{ marginLeft: 8 }}
                  >
                    Xóa hợp đồng
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <strong>Trạng thái:</strong> Chưa upload
              </div>
            )}
          </div>
        )}
      </div>

      <div className="upload-card mb-24">
        <div className="du-user-row mb-16">
          <span className="fs-24">📄</span>
          <div>
            <h3 className="du-title">Hợp đồng thực tập</h3>
            <p className="du-desc">Định dạng PDF hoặc DOCX • Tối đa 10MB</p>
          </div>
        </div>

        <label
          className="du-dropzone"
          htmlFor="file-contract"
          style={{ cursor: "pointer" }}
        >
          <input
            id="file-contract"
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            className="hidden-input"
          />
          {!file ? (
            <>
              <div className="du-icon-xl">📁</div>
              <div className="du-file-name">Click để chọn file hợp đồng</div>
              <div className="du-file-size">
                Hỗ trợ: PDF, DOCX • Tối đa 10MB
              </div>
            </>
          ) : (
            <>
              <div className="fs-24 mb-8">✅</div>
              <div className="du-file-name">{file.name}</div>
              <div className="du-file-size">{formatFileSize(file.size)}</div>
            </>
          )}
        </label>

        <div className="du-actions">
          <button
            className="p-btn p-btn-primary"
            onClick={onUpload}
            disabled={!selectedInternId || !file || uploading}
          >
            {uploading ? "Đang tải lên..." : "Tải lên hợp đồng"}
          </button>
          {file && (
            <button
              className="p-btn p-btn-outline-danger"
              onClick={() => {
                setFile(null);
                setError("");
                setMessage("");
                const input = document.getElementById("file-contract");
                if (input) input.value = "";
              }}
            >
              Hủy
            </button>
          )}
        </div>

        {message && (
          <div className="du-alert du-alert--success">✅ {message}</div>
        )}
        {error && <div className="du-alert du-alert--error">❌ {error}</div>}
      </div>
    </div>
  );
}
