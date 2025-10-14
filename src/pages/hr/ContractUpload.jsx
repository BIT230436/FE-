import React, { useState, useEffect } from "react";
import { getInternships } from "../../services/internshipService";
import { uploadToCloud } from "../../services/documentService";
import { useAuthStore } from "../../store/authStore";
import "./ContractUpload.css";

export default function UploadContractForm() {
  const user = useAuthStore((s) => s.user);

  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [interns, setInterns] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Fetch danh sách intern khi mở modal
  useEffect(() => {
    if (showModal) {
      fetchInterns();
    }
  }, [showModal, searchQuery]);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const response = await getInternships({ q: searchQuery, size: 50 });

      const internList = response.data || response;
      setInterns(internList);
    } catch (error) {
      console.error("Error fetching interns:", error);
      setInterns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern);
    setShowModal(false);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setUploadSuccess(false);
      setUploadError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
      setUploadSuccess(false);
      setUploadError("");
    }
  };

  const clearFile = () => {
    setFileName("");
    setFile(null);
    setUploadSuccess(false);
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!selectedIntern || !file) return;

    setUploading(true);
    setUploadError("");
    setUploadSuccess(false);

    try {
      // Lấy hrId từ user object (user.id từ auth store)
      const hrId = user?.id;

      // Lấy internId - cố gắng từ nhiều key khác nhau
      const internId =
        selectedIntern?.intern_id ||
        selectedIntern?.internProfileId ||
        selectedIntern?.id;

      console.log("=== DEBUG INFO ===");
      console.log("Selected Intern:", selectedIntern);
      console.log("Intern ID:", internId);
      console.log("Intern object keys:", Object.keys(selectedIntern));
      console.log("HR ID:", hrId);
      console.log("File:", file);
      console.log("==================");

      if (!hrId || hrId === "undefined" || hrId === undefined) {
        setUploadError("Không tìm thấy thông tin HR. Vui lòng đăng nhập lại!");
        setUploading(false);
        return;
      }

      if (!internId || internId === "undefined" || internId === undefined) {
        setUploadError("Không tìm thấy ID thực tập sinh!");
        setUploading(false);
        return;
      }

      const response = await uploadToCloud({
        internProfileId: internId, // ← Sử dụng internId từ object
        file: file,
        hrId: Number(hrId),
      });

      console.log("Upload success:", response);
      setUploadSuccess(true);

      // Reset form sau 2 giây
      setTimeout(() => {
        setFile(null);
        setFileName("");
        setSelectedIntern(null);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error.response?.data?.message || "Upload thất bại. Vui lòng thử lại!"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom right, #eff6ff, #ffffff, #eff6ff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "672px",
          padding: "32px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "30px",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "8px",
            }}
          >
            Upload Hợp Đồng
          </h1>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Input Name */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Tên Thực Tập Sinh
              </label>
              <button
                style={{
                  padding: "6px 16px",
                  backgroundColor: "#22d3ee",
                  color: "white",
                  fontSize: "14px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#06b6d4")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#22d3ee")}
                onClick={() => setShowModal(true)}
              >
                Chọn từ danh sách
              </button>
            </div>
            <input
              type="text"
              placeholder="Nhập tên hoặc email thực tập sinh..."
              value={
                selectedIntern
                  ? `${selectedIntern.student} (${selectedIntern.studentEmail})`
                  : ""
              }
              readOnly
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: selectedIntern ? "#f3f4f6" : "white",
                cursor: "default",
              }}
            />
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? "#3b82f6" : "#d1d5db"}`,
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
              backgroundColor: isDragging ? "#eff6ff" : "#f9fafb",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "96px",
                  fontWeight: "300",
                  color: "#9ca3af",
                }}
              >
                [File]
              </div>

              {fileName ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: "#dbeafe",
                    borderRadius: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#1e40af",
                      fontWeight: "500",
                    }}
                  >
                    {fileName}
                  </span>
                  <button
                    onClick={clearFile}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#1e40af",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ color: "#4b5563", marginBottom: "8px" }}>
                    Kéo thả file vào đây hoặc{" "}
                    <label
                      style={{
                        color: "#3b82f6",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      chọn file
                      <input
                        type="file"
                        style={{ display: "none" }}
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                    }}
                  >
                    PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <button
            disabled={!fileName || !selectedIntern || uploading}
            onClick={handleUpload}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "8px",
              fontWeight: "500",
              color: "white",
              fontSize: "16px",
              border: "none",
              backgroundColor:
                fileName && selectedIntern && !uploading
                  ? "#6b7280"
                  : "#9ca3af",
              cursor:
                fileName && selectedIntern && !uploading
                  ? "pointer"
                  : "not-allowed",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) => {
              if (fileName && selectedIntern && !uploading)
                e.target.style.backgroundColor = "#4b5563";
            }}
            onMouseOut={(e) => {
              if (fileName && selectedIntern && !uploading)
                e.target.style.backgroundColor = "#6b7280";
            }}
          >
            {uploading ? "Đang tải lên..." : "[Upload] Upload File"}
          </button>

          {/* Success Message */}
          {uploadSuccess && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#d1fae5",
                border: "1px solid #10b981",
                borderRadius: "8px",
                color: "#065f46",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              ✓ Upload thành công!
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#fee2e2",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              ✗ {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Modal chọn intern */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#1f2937",
                    margin: 0,
                  }}
                >
                  Chọn Thực Tập Sinh
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    color: "#6b7280",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow =
                    "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "16px 24px",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "#6b7280",
                  }}
                >
                  Đang tải...
                </div>
              ) : interns.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    color: "#6b7280",
                  }}
                >
                  Không tìm thấy thực tập sinh
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {interns.map((intern) => (
                    <div
                      key={intern.intern_id}
                      onClick={() => handleSelectIntern(intern)}
                      style={{
                        padding: "16px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        backgroundColor:
                          selectedIntern?.intern_id === intern.intern_id
                            ? "#eff6ff"
                            : "white",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "#f9fafb";
                        e.currentTarget.style.borderColor = "#3b82f6";
                      }}
                      onMouseOut={(e) => {
                        if (selectedIntern?.intern_id !== intern.intern_id) {
                          e.currentTarget.style.backgroundColor = "white";
                        } else {
                          e.currentTarget.style.backgroundColor = "#eff6ff";
                        }
                        e.currentTarget.style.borderColor = "#e5e7eb";
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "500",
                          color: "#1f2937",
                          marginBottom: "4px",
                        }}
                      >
                        {intern.student}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        {intern.studentEmail}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
