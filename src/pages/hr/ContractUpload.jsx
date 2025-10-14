import React, { useState, useRef, useEffect } from "react";
import { uploadToCloud } from "../../services/documentService";
import { getUsers } from "../../services/adminService";
import "./ContractUpload.css";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadResult, setUploadResult] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [internId, setInternId] = useState("");
  const [internEmail, setInternEmail] = useState("");
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [allInterns, setAllInterns] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSelectIntern, setShowSelectIntern] = useState(false);

  const fileInputRef = useRef(null);

  // Load danh sách interns khi component mount
  useEffect(() => {
    loadInterns();
  }, []);

  async function loadInterns() {
    setIsSearching(true);
    try {
      const response = await getUsers({ role: "INTERN", status: "" });
      const userList = response.content || [];
      setAllInterns(userList);
    } catch (error) {
      console.error("Error loading interns:", error);
      setErrorMessage("Không thể tải danh sách thực tập sinh.");
    } finally {
      setIsSearching(false);
    }
  }

  // Filter interns khi searchTerm thay đổi
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInterns([]);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = allInterns.filter((intern) => {
      return (
        intern.fullName?.toLowerCase().includes(search) ||
        intern.email?.toLowerCase().includes(search)
      );
    });

    setFilteredInterns(filtered);
  }, [searchTerm, allInterns]);

  const handleSelectIntern = (intern) => {
    setInternId(intern.id);
    setInternEmail(intern.email || "");
    setSearchTerm(intern.fullName || intern.name);
    setFilteredInterns([]);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setUploadResult(null);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Vui lòng chọn file.");
      return;
    }
    if (!internId) {
      setErrorMessage("Vui lòng chọn thực tập sinh.");
      return;
    }

    setUploadStatus("uploading");
    setErrorMessage("");

    try {
      const result = await uploadToCloud({
        internId,
        file: selectedFile,
      });
      setUploadStatus("success");
      setUploadResult(result);

      setTimeout(() => {
        setSelectedFile(null);
        setSearchTerm("");
        setInternId("");
        setInternEmail("");
        setUploadStatus("idle");
        setUploadResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 2000);
    } catch (error) {
      setUploadStatus("error");
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErrorMessage("Dữ liệu không hợp lệ, vui lòng kiểm tra lại.");
            break;
          case 401:
            setErrorMessage("Bạn chưa đăng nhập hoặc hết phiên.");
            break;
          case 413:
            setErrorMessage("File quá lớn (vượt quá giới hạn 10MB).");
            break;
          case 500:
            setErrorMessage("Lỗi hệ thống, vui lòng thử lại sau.");
            break;
          default:
            setErrorMessage(
              error.response.data?.message || "Có lỗi xảy ra khi upload file."
            );
        }
      } else if (error.request) {
        setErrorMessage("Không thể kết nối đến server, vui lòng thử lại.");
      } else {
        setErrorMessage(error.message || "Có lỗi xảy ra.");
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-card">
        <h2 className="upload-title">Upload Hợp Đồng</h2>

        <div className="form-group">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <label className="form-label">Tên Thực Tập Sinh</label>
            <button
              type="button"
              className="btn btn-info btn-sm"
              onClick={() => setShowSelectIntern(true)}
              disabled={uploadStatus === "uploading"}
              style={{
                fontSize: "13px",
                padding: "4px 12px",
              }}
            >
              Chọn từ danh sách
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setInternId("");
                setInternEmail("");
              }}
              className="form-input"
              placeholder="Nhập tên hoặc email thực tập sinh..."
              disabled={uploadStatus === "uploading"}
            />
            {isSearching && (
              <span
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#666",
                }}
              >
                Đang tìm...
              </span>
            )}
          </div>

          {internId && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "14px",
                color: "#007bff",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: "bold",
              }}
            >
              <span className="selected-email">{internEmail}</span>
            </div>
          )}

          {filteredInterns.length > 0 && (
            <ul className="dropdown-list">
              {filteredInterns.map((intern) => (
                <li
                  key={intern.id}
                  className="dropdown-item"
                  onClick={() => handleSelectIntern(intern)}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span className="intern-name" style={{ fontWeight: "500" }}>
                      {intern.fullName || intern.name}
                    </span>
                    {intern.email && (
                      <span
                        className="intern-email"
                        style={{ fontSize: "13px", color: "#666" }}
                      >
                        {intern.email}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isSearching &&
            searchTerm.trim() &&
            filteredInterns.length === 0 && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: "#856404",
                }}
              >
                Không tìm thấy thực tập sinh với tên "{searchTerm}"
              </div>
            )}
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`upload-area ${selectedFile ? "has-file" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="file-input-hidden"
            id="fileInput"
            disabled={uploadStatus === "uploading"}
          />
          {!selectedFile ? (
            <label htmlFor="fileInput" className="upload-label">
              <div className="upload-icon">[File]</div>
              <p className="upload-text">
                Kéo thả file vào đây hoặc{" "}
                <span className="upload-link">chọn file</span>
              </p>
              <p className="upload-hint">
                PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
              </p>
            </label>
          ) : (
            <div className="file-preview">
              <div className="file-info">
                <div className="file-icon">[File]</div>
                <div className="file-details">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              {uploadStatus !== "uploading" && (
                <button onClick={removeFile} className="remove-button">
                  X
                </button>
              )}
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <span className="alert-icon">[!]</span>
            <p>{errorMessage}</p>
          </div>
        )}

        {uploadStatus === "success" && uploadResult && (
          <div className="alert alert-success">
            <div className="alert-header">
              <span className="alert-icon">[OK]</span>
              <p className="alert-title">Upload thành công!</p>
            </div>
            {uploadResult.url && (
              <a
                href={uploadResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="result-link"
              >
                Xem file đã upload
              </a>
            )}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === "uploading" || !internId}
          className={`upload-button ${
            uploadStatus === "uploading" ? "uploading" : ""
          }`}
        >
          {uploadStatus === "uploading" ? (
            <>
              <span className="spinner">...</span>
              <span>Đang upload...</span>
            </>
          ) : (
            <>
              <span>[Upload]</span>
              <span>Upload File</span>
            </>
          )}
        </button>
      </div>

      {showSelectIntern && (
        <SelectInternModal
          interns={allInterns}
          loading={isSearching}
          onClose={() => setShowSelectIntern(false)}
          onSelect={(intern) => {
            handleSelectIntern(intern);
            setShowSelectIntern(false);
          }}
        />
      )}
    </div>
  );
};

function SelectInternModal({ interns, loading, onClose, onSelect }) {
  const [searchText, setSearchText] = useState("");

  const filteredInterns = interns.filter((intern) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      intern.fullName?.toLowerCase().includes(search) ||
      intern.email?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "600px", width: "70%" }}>
        <h2 className="modal-title">Chọn Thực tập sinh</h2>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <input
            className="form-input"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}>Đang tải...</div>
        ) : filteredInterns.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "#666" }}>
            {searchText
              ? "Không tìm thấy thực tập sinh phù hợp"
              : "Không có thực tập sinh nào trong hệ thống"}
          </div>
        ) : (
          <div
            style={{ maxHeight: "500px", overflowY: "auto", marginBottom: 16 }}
          >
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">Họ tên</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterns.map((intern) => (
                  <tr key={intern.id}>
                    <td className="table-td">{intern.fullName}</td>
                    <td className="table-td">{intern.email}</td>
                    <td className="table-td">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onSelect(intern)}
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
