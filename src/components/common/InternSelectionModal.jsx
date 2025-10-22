import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getInternships } from "../../services/internshipService";
import { toast } from "react-toastify";

export default function InternSelectionModal({ onClose, onSelect }) {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInterns = async () => {
      setLoading(true);
      try {
        const response = await getInternships({ q: searchQuery, size: 50 });
        setInterns(response.data || response || []);
      } catch (error) {
        console.error("Failed to fetch interns:", error);
        toast.error("Không thể tải danh sách thực tập sinh.");
        setInterns([]);
      } finally {
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
        style={{ display: "flex", flexDirection: "column", maxHeight: "80vh" }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Chọn Thực Tập Sinh</h2>
          <button onClick={onClose} className="modal-close-btn">
            ✕
          </button>
        </div>
        <div className="modal-body" style={{ overflowY: "auto" }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />
          {loading ? (
            <div className="loading center">Đang tải...</div>
          ) : interns.length === 0 ? (
            <div className="center">Không tìm thấy thực tập sinh.</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th className="table-th" style={{ width: "35%" }}>
                    Tên thực tập sinh
                  </th>
                  <th className="table-th" style={{ width: "65%" }}>
                    Email
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
                    <td className="table-td">{intern.student}</td>
                    <td className="table-td">{intern.studentEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
