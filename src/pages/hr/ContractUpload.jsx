// src/components/your-path/ContractUpload.js

import { useEffect, useState } from "react";
import { getInterns } from "../../services/internService";
// Import các hàm từ service đã được cập nhật
import {
  getDocsByIntern,
  uploadInternDoc, // <-- Hàm này giờ đã chứa logic upload mới
  deleteDoc,
} from "../../services/documentService";
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
      const response = await getInterns({ size: 50 });
      // Normalize: supports {data: []} or {items: []} or []
      let rows = [];
      if (Array.isArray(response?.data)) {
        rows = response.data;
      } else if (Array.isArray(response?.items)) {
        rows = response.items;
      } else if (Array.isArray(response)) {
        rows = response;
      }
      console.log("📋 Loaded interns:", rows);
      setInterns(rows);
      if (!selectedInternId && rows.length > 0) {
        const firstId = (rows[0].id ?? rows[0].internId)?.toString();
        setSelectedInternId(firstId);
      }
    } catch (e) {
      setError("Không tải được danh sách thực tập sinh");
      console.error("loadInterns error", e);
    } finally {
      setLoadingInterns(false);
    }
  }

  useEffect(() => {
    loadInterns();
  }, []);

  useEffect(() => {
    async function loadContract() {
      if (!selectedInternId) {
        setContractInfo({ loading: false, doc: null });
        return;
      }
      setContractInfo({ loading: true, doc: null });
      try {
        const rows = await getDocsByIntern(selectedInternId);
        const normalized = (rows || []).map((r) => ({
          id: r.document_id || r.id,
          type: (r.document_type || r.type || "").toString().toUpperCase(),
          fileName: r.file_name || r.fileName || r.file || "",
          uploadedAt:
            r.uploaded_at || r.uploadedAt || r.createdAt || r.created_at,
          status: r.status,
        }));
        const contract = normalized.find((d) => d.type === "CONTRACT") || null;
        setContractInfo({ loading: false, doc: contract });
      } catch (e) {
        setContractInfo({ loading: false, doc: null });
        console.error("loadContract error", e);
      }
    }
    loadContract();
  }, [selectedInternId]);

  const handleChangeIntern = (e) => {
    const newId = e.target.value;
    setSelectedInternId(newId);
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
      // >>> KHÔNG CẦN THAY ĐỔI GÌ Ở ĐÂY <<<
      // Lệnh gọi này giờ sẽ tự động sử dụng logic API mới từ service
      await uploadInternDoc({
        internId: selectedInternId,
        type: "CONTRACT",
        file,
      });
      setMessage("Tải lên hợp đồng thành công! Vui lòng chờ HR duyệt.");
      setFile(null);
      const input = document.getElementById("file-contract");
      if (input) input.value = "";
      // Refresh contract status (logic này đã đúng)
      const rows = await getDocsByIntern(selectedInternId);
      const normalized = (rows || []).map((r) => ({
        id: r.document_id || r.id,
        type: (r.document_type || r.type || "").toString().toUpperCase(),
        fileName: r.file_name || r.fileName || r.file || "",
        uploadedAt:
          r.uploaded_at || r.uploadedAt || r.createdAt || r.created_at,
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

  // ...Phần JSX của bạn giữ nguyên, không cần thay đổi...
  return (
    <div className="profile-container">
      {/* ... Toàn bộ JSX của bạn ở đây ... */}
    </div>
  );
}
