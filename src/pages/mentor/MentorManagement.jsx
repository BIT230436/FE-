import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  getMentorAssignments,
  unassignMentor,
  assignMentor,
} from "../../services/mentorService";
import { getInternships } from "../../services/internshipService";
import { getUsers } from "../../services/adminService";
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
      const [mentorsRes, assignmentsRes, internshipsRes] = await Promise.all([
        getUsers({ role: "MENTOR", size: 1000 }),
        getMentorAssignments({}).catch(() => ({ data: [] })),
        getInternships({ size: 1000 }),
      ]);

      const mentors = mentorsRes.content || [];
      const allAssignments = assignmentsRes.data || [];
      const internships = internshipsRes.data || [];

      // Create a map for quick lookup
      const mentorMap = new Map(mentors.map((m) => [m.id, m.fullName]));
      const internMap = new Map(internships.map((i) => [i.intern_id, i.student]));

      // Create a detailed list of assignments
      const detailedAssignments = allAssignments.map((a) => ({
        ...a,
        mentorName: mentorMap.get(a.mentor_id) || "N/A",
        internName: internMap.get(a.intern_id) || "N/A",
      }));

      // If there's a search query, filter by mentor name
      const finalAssignments = debouncedSearchText
        ? detailedAssignments.filter((a) => 
            a.mentorName.toLowerCase().includes(debouncedSearchText.toLowerCase())
          )
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
        await unassignMentor(internId, mentorId);
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
          Phân công Mentor
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
            <tr key={`${assignment.mentor_id}-${assignment.intern_id}`}>
              <td>{assignment.mentorName}</td>
              <td>{assignment.internName}</td>
              <td>
                <button
                  onClick={() =>
                    handleUnassign(assignment.intern_id, assignment.mentor_id)
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
        const [allMentorsRes, allInternshipsRes, allAssignmentsRes] =
          await Promise.all([
            getUsers({ role: "MENTOR", size: 1000 }),
            getInternships({ size: 1000 }),
            getMentorAssignments({}).catch(() => ({ data: [] })),
          ]);

        const assignedInternIds = new Set(
          (allAssignmentsRes.data || []).map((a) => a.intern_id)
        );

        // Lấy mentors từ users có role MENTOR
        setAvailableMentors(allMentorsRes.content || []);
        
        // Lấy interns từ danh sách thực tập, loại bỏ những người đã được phân công
        const internships = allInternshipsRes.data || [];
        const availableInternsList = internships.filter(
          (i) => !assignedInternIds.has(i.intern_id)
        );
        
        console.log("Available interns:", availableInternsList);
        console.log("First intern sample:", availableInternsList[0]);
        console.log("All keys:", availableInternsList[0] ? Object.keys(availableInternsList[0]) : []);
        setAvailableInterns(availableInternsList);
      } catch (error) {
        toast.error("Không thể tải danh sách mentor hoặc thực tập sinh.");
      }
    };
    loadInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("handleSubmit called!");
    console.log("selectedMentor:", selectedMentor);
    console.log("selectedIntern:", selectedIntern);
    
    if (!selectedMentor || !selectedIntern) {
      console.log("Validation failed - missing mentor or intern");
      toast.error("Vui lòng chọn mentor và thực tập sinh.");
      return;
    }

    console.log("Submitting:", {
      mentorId: Number(selectedMentor),
      internId: Number(selectedIntern),
    });

    try {
      const result = await assignMentor({
        mentorId: Number(selectedMentor),
        internId: Number(selectedIntern),
      });
      
      console.log("Assign result:", result);
      
      if (result.success) {
        toast.success(result.message || "Phân công thành công!");
        onAssignmentCreated();
        onClose();
      } else {
        toast.error(result.message || "Phân công thất bại.");
      }
    } catch (error) {
      console.error("Failed to assign mentor:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);
      const errorMsg = error?.response?.data?.message || error?.message || "Phân công thất bại.";
      toast.error(errorMsg);
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
                  {m.fullName} ({m.email})
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
                <option key={i.intern_id} value={i.intern_id}>
                  {i.student} ({i.studentEmail})
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
