import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getMentors } from "../../services/mentorService"; // ✅ import đúng service
import { toast } from "react-toastify";

export default function MentorSelectionModal({ onClose, onSelect }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    const fetchMentors = async () => {
      if (mentors.length === 0) setLoading(true);
      try {
        const response = await getMentors({
          q: searchQuery,
          department,
          size: 50,
        });
        setMentors(response.data || response || []);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
        toast.error("Không thể tải danh sách mentor.");
        setMentors([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchMentors, 500);
    return () => clearTimeout(debounceFetch);
  }, [searchQuery, department]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box large"
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", flexDirection: "column", maxHeight: "80vh" }}
      >
        <div className="modal-header">
          <h2 className="modal-title">Chọn Mentor</h2>
          <button onClick={onClose} className="modal-close-btn">
            ✕
          </button>
        </div>

        <div className="modal-body" style={{ overflowY: "auto" }}>
          {/* Thanh tìm kiếm */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 2 }}
            />
            <select
              className="form-select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ flex: 1 }}
            >
              
            </select>
          </div>

          {loading ? (
            <div className="loading center">Đang tải...</div>
          ) : mentors.length === 0 ? (
            <div className="center">Không tìm thấy mentor nào.</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th className="table-th" style={{ width: "35%" }}>
                    Tên Mentor
                  </th>
                  <th className="table-th" style={{ width: "45%" }}>
                    Email
                  </th>
                  <th className="table-th" style={{ width: "20%" }}>
                    Phòng ban
                  </th>
                </tr>
              </thead>
              <tbody>
                {mentors.map((mentor) => (
                  <tr
                    key={mentor.id}
                    onClick={() => onSelect(mentor)}
                    onKeyPress={(e) => e.key === "Enter" && onSelect(mentor)}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="table-td">{mentor.name}</td>
                    <td className="table-td">{mentor.email}</td>
                    <td className="table-td">{mentor.department}</td>
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

MentorSelectionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};
