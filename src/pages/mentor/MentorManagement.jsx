import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  getMentors,
  getMentorAssignments,
  unassignMentor,
  assignMentor,
} from "../../services/mentorService";
import { getInterns } from "../../services/internService";
import { toast } from "react-toastify";
import "./MentorManagement.css";

const MentorManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  // Debounce search text
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all necessary data in parallel
      const [mentorsRes, assignmentsRes, internsRes] = await Promise.all([
        getMentors({ q: debouncedSearchText, size: 1000 }),
        getMentorAssignments({ size: 1000 }),
        getInterns({ size: 1000 }),
      ]);

      const mentors = mentorsRes.items || [];
      const allAssignments = assignmentsRes.items || [];
      const interns = internsRes || [];

      // Create a map for quick lookup
      const mentorMap = new Map(mentors.map((m) => [m.id, m.name]));
      const internMap = new Map(interns.map((i) => [i.id, i.fullName]));

      // Create a detailed list of assignments
      const detailedAssignments = allAssignments.map((a) => ({
        ...a,
        mentorName: mentorMap.get(a.mentorId) || "N/A",
        internName: internMap.get(a.internId) || "N/A",
      }));

      // If there's a search query, we need to filter assignments by the mentors that were returned
      const mentorIdsFromSearch = new Set(mentors.map((m) => m.id));
      const finalAssignments = debouncedSearchText
        ? detailedAssignments.filter((a) => mentorIdsFromSearch.has(a.mentorId))
        : detailedAssignments;

      setAssignments(finalAssignments);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUnassign = async (internId, mentorId) => {
    if (globalThis.confirm("Bạn có chắc chắn muốn hủy phân công này không?")) {
      try {
        await unassignMentor({ internId, mentorId });
        toast.success("Đã hủy phân công thành công.");
        fetchData(); // Refetch data to update the list
      } catch (error) {
        toast.error("Hủy phân công thất bại.");
      }
    }
  };

  return (
    <div className="mentor-management-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý Mentor</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Quân công Mentor
        </button>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div className="form-group">
          <label htmlFor="mentor-search" className="form-label">
            Search by Name
          </label>
          <input
            id="mentor-search"
            className="form-input"
            placeholder="Enter name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <table className="mentor-table">
        <thead>
          <tr>
            <th>Tên Mentor</th>
            <th>Tên Thực tập sinh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={`${assignment.mentorId}-${assignment.internId}`}>
              <td>{assignment.mentorName}</td>
              <td>{assignment.internName}</td>
              <td>
                <button
                  onClick={() =>
                    handleUnassign(assignment.internId, assignment.mentorId)
                  }
                  className="delete-button"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddModal && (
        <AssignMentorModal
          onClose={() => setShowAddModal(false)}
          onAssignmentCreated={fetchData} // Refetch data after a new assignment is created
        />
      )}
    </div>
  );
};

export default MentorManagement;

// --- AssignMentorModal Component ---
function AssignMentorModal({ onClose, onAssignmentCreated }) {
  const [availableMentors, setAvailableMentors] = useState([]);
  const [availableInterns, setAvailableInterns] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedIntern, setSelectedIntern] = useState("");

  useEffect(() => {
    // Fetch available mentors and interns when the modal opens
    const loadInitialData = async () => {
      try {
        const [allMentorsRes, allInternsRes, allAssignmentsRes] =
          await Promise.all([
            getMentors({ size: 1000 }),
            getInterns({ size: 1000 }),
            getMentorAssignments({ size: 1000 }),
          ]);

        const assignedInternIds = new Set(
          allAssignmentsRes.items.map((a) => a.internId)
        );

        setAvailableMentors(allMentorsRes.items || []);
        setAvailableInterns(
          (allInternsRes.items || []).filter(
            (i) => !assignedInternIds.has(i.id)
          )
        );
      } catch (error) {
        toast.error("Không thể tải danh sách mentor hoặc thực tập sinh.");
      }
    };
    loadInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMentor || !selectedIntern) {
      toast.error("Vui lòng chọn mentor và thực tập sinh.");
      return;
    }

    try {
      await assignMentor({
        mentorId: selectedMentor,
        internId: selectedIntern,
      });
      toast.success("Phân công thành công!");
      onAssignmentCreated();
      onClose();
    } catch (error) {
      console.error("Failed to assign mentor:", error);
      toast.error("Phân công thất bại.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Phân công Mentor</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mentor-select">Chọn Mentor</label>
            <select
              id="mentor-select"
              className="form-select"
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
            >
              <option value="" disabled>
                -- Chọn một mentor --
              </option>
              {availableMentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="intern-select">Chọn Thực tập sinh</label>
            <select
              id="intern-select"
              className="form-select"
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
            >
              <option value="" disabled>
                -- Chọn một thực tập sinh --
              </option>
              {availableInterns.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AssignMentorModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAssignmentCreated: PropTypes.func.isRequired,
};
