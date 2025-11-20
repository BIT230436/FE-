import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getInternships } from "../../services/internshipService";
import { toast } from "react-toastify";

export default function InternSelectionModal({ onClose, onSelect }) {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterns = async () => {
      // Chỉ hiển thị loading toàn màn hình cho lần tải đầu tiên
      if (interns.length === 0) {
        setLoading(true);
      }
      setError("");

      try {
        const response = await getInternships({
          q: searchQuery,
          size: 100,
          status: 'active' // ✅ Chỉ lấy intern đang active
        });

        // ✅ Handle response format mới từ backend
        const internData = response.data || response || [];
        setInterns(internData);

        // ✅ Hiển thị thông báo nếu không có intern
        if (internData.length === 0 && !searchQuery) {
          setError("Bạn chưa quản lý program nào hoặc chưa có thực tập sinh trong các program của bạn");
        }

      } catch (error) {
        console.error("Failed to fetch interns:", error);
        const errorMsg = error.response?.data?.message || "Không thể tải danh sách thực tập sinh.";
        setError(errorMsg);
        toast.error(errorMsg);
        setInterns([]);
      } finally {
        // Luôn tắt loading sau khi hoàn tất
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchInterns();
    }, 500);

    return () => clearTimeout(debounceFetch);
  }, [searchQuery]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box large"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          width: "90%",
          maxWidth: "1000px"
        }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Chọn Thực Tập Sinh</h2>
          <button onClick={onClose} className="modal-close-btn">
            ✕
          </button>
        </div>
        <div className="modal-body" style={{
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: "200px",
          maxHeight: "calc(90vh - 150px)",
          padding: "0"
        }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />

          {/* ✅ Hiển thị số lượng intern */}
          {!loading && interns.length > 0 && (
            <div style={{
              marginBottom: "1rem",
              padding: "0.5rem",
              background: "#f0f9ff",
              borderRadius: "4px",
              fontSize: "14px",
              color: "#0369a1"
            }}>
              📋 Có <strong>{interns.length}</strong> thực tập sinh trong các program bạn quản lý
            </div>
          )}

          {loading ? (
            <div className="loading center">Đang tải...</div>
          ) : error ? (
            <div className="center" style={{
              padding: "2rem",
              color: "#dc2626",
              textAlign: "center"
            }}>
              ⚠️ {error}
            </div>
          ) : interns.length === 0 ? (
            <div className="center" style={{ padding: "2rem", textAlign: "center" }}>
              {searchQuery
                ? `Không tìm thấy thực tập sinh phù hợp với "${searchQuery}"`
                : "Không tìm thấy thực tập sinh."}
            </div>
          ) : (
            <div style={{ 
              width: "100%",
              overflowX: "auto"
            }}>
              <table className="table table-hover" style={{
                width: "100%",
                tableLayout: "auto",
                minWidth: "100%",
                margin: 0,
                borderCollapse: "collapse"
              }}>
              <thead>
                <tr>
                  <th className="table-th" style={{
                    padding: "12px",
                    textAlign: "left",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    position: "sticky",
                    top: 0,
                    zIndex: 10
                  }}>
                    Tên thực tập sinh
                  </th>
                  <th className="table-th" style={{
                    padding: "12px 24px 12px 40px",
                    textAlign: "left",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    minWidth: "250px"
                  }}>
                    Email
                  </th>
                  <th className="table-th" style={{
                    padding: "12px",
                    textAlign: "left",
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                    position: "sticky",
                    top: 0,
                    zIndex: 10
                  }}>
                    Dự án
                  </th>
                </tr>
              </thead>
              <tbody>
                {interns.map((intern) => (
                  <tr
                    key={intern.intern_id || intern.id}
                    onClick={() => onSelect(intern)}
                    onKeyPress={(e) => e.key === "Enter" && onSelect(intern)}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="table-td" style={{
                      padding: "12px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #f1f5f9"
                    }}>
                      {intern.student || intern.fullname}
                    </td>
                    <td className="table-td" style={{
                      padding: "12px 24px 12px 40px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #f1f5f9"
                    }}>
                      {intern.studentEmail || intern.email}
                    </td>
                    <td className="table-td" style={{
                      padding: "12px",
                      fontSize: "13px",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      borderBottom: "1px solid #f1f5f9"
                    }}>
                      {intern.programName || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

InternSelectionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};