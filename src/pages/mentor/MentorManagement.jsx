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
      const [mentorsRes, assignmentsResponse, internshipsRes] = await Promise.all([
        getUsers({ role: "MENTOR", size: 1000 }),
        getMentorAssignments({}).catch((err) => {
          console.error("Failed to fetch assignments:", err);
          return { data: [] }; // Return empty data on error
        }),
        getInternships({ size: 1000 }),
      ]);

      const mentors = mentorsRes.content || [];

      // ✅ FIX: Extract data array from response object
      const allAssignments = assignmentsResponse?.data || [];

      const internships = internshipsRes.data || [];

      // Create a map for quick lookup
      const mentorMap = new Map(mentors.map((m) => [m.id, m.fullName]));
      const internMap = new Map(
        internships.map((i) => [
          i.intern_id,
          { name: i.student, programId: i.program_id },
        ])
      );

      // Group assignments by mentor_id and program_id
      const groupedMap = new Map();

      allAssignments.forEach((assignment) => {
        const mentorName = mentorMap.get(assignment.mentor_id) || "N/A";
        const internData = internMap.get(assignment.intern_id);
        const programId = internData?.programId || assignment.program_id || "N/A";
        const internName = internData?.name || "N/A";

        // Create unique key: mentor_id + program_id
        const key = `${assignment.mentor_id}-${programId}`;

        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            mentor_id: assignment.mentor_id,
            mentorName: mentorName,
            programId: programId,
            interns: [],
          });
        }

        groupedMap.get(key).interns.push({
          intern_id: assignment.intern_id,
          name: internName,
        });
      });

      // Convert to array and filter by search text
      let finalAssignments = Array.from(groupedMap.values());

      if (debouncedSearchText) {
        finalAssignments = finalAssignments.filter((a) =>
          a.mentorName.toLowerCase().includes(debouncedSearchText.toLowerCase())
        );
      }

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

  const handleUnassignGroup = async (mentorId, programId, interns) => {
    if (globalThis.confirm(`Bạn có chắc chắn muốn hủy phân công cho Nhóm ${programId} (${interns.length} thực tập sinh)?`)) {
      try {
        // Unassign all interns in the group
        const unassignPromises = interns.map((intern) =>
          unassignMentor(intern.intern_id, mentorId)
        );
        
        await Promise.all(unassignPromises);
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
            <th>Mentor</th>
            <th>Nhóm</th>
            <th>Tên Thực tập sinh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={`${assignment.mentor_id}-${assignment.programId}`}>
              <td>{assignment.mentorName}</td>
              <td>Nhóm {assignment.programId}</td>
              <td>
                {assignment.interns && assignment.interns.length > 0 ? (
                  <>
                    {assignment.interns.map((intern, idx) => (
                      <div key={intern.intern_id}>
                        {intern.name}
                      </div>
                    ))}
                    <div style={{ marginTop: 4, fontSize: "0.9em", color: "#666" }}>
                      ({assignment.interns.length} thực tập sinh)
                    </div>
                  </>
                ) : (
                  <span>Không có thực tập sinh</span>
                )}
              </td>
              <td>
                <button
                  onClick={() =>
                    handleUnassignGroup(assignment.mentor_id, assignment.programId, assignment.interns || [])
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
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    // Fetch available mentors and groups when the modal opens
    const loadInitialData = async () => {
      try {
        const [allMentorsRes, allInternshipsRes, allAssignmentsRes] =
          await Promise.all([
            getUsers({ role: "MENTOR", size: 1000 }),
            getInternships({ size: 1000 }),
            getMentorAssignments({}).catch(() => ({ data: [] })),
          ]);

        // ✅ FIX: Extract data from response
        const assignedInternIds = new Set(
          (allAssignmentsRes?.data || []).map((a) => a.intern_id)
        );

        // Lấy mentors từ users có role MENTOR
        setAvailableMentors(allMentorsRes.content || []);
        
        // Nhóm các intern theo program_id
        const internships = allInternshipsRes.data || [];
        const groupMap = new Map();
        
        console.log("Sample intern data:", internships[0]);
        
        internships.forEach((intern) => {
          // Dữ liệu từ API có program_id trực tiếp trong object, không phải nested
          const programId = intern.program_id;
          // Hiển thị "Nhóm {program_id}" thay vì tên chương trình
          const programTitle = `Nhóm ${programId}`;
          
          if (programId) {
            if (!groupMap.has(programId)) {
              groupMap.set(programId, {
                programId: programId,
                programTitle: programTitle,
                interns: [],
                hasAssignedIntern: false,
              });
            }
            
            const group = groupMap.get(programId);
            group.interns.push(intern);
            
            // Kiểm tra xem có intern nào trong nhóm đã được phân công chưa
            if (assignedInternIds.has(intern.intern_id)) {
              group.hasAssignedIntern = true;
            }
          }
        });
        
        // Chỉ hiển thị các nhóm chưa có intern nào được phân công
        const groups = Array.from(groupMap.values())
          .filter(group => !group.hasAssignedIntern)
          .sort((a, b) => a.programId - b.programId);
        
        console.log("Available groups:", groups);
        setAvailableGroups(groups);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Không thể tải danh sách mentor hoặc nhóm.");
      }
    };
    loadInitialData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("handleSubmit called!");
    console.log("selectedMentor:", selectedMentor);
    console.log("selectedGroup:", selectedGroup);
    
    if (!selectedMentor || !selectedGroup) {
      console.log("Validation failed - missing mentor or group");
      toast.error("Vui lòng chọn mentor và nhóm.");
      return;
    }

    // Tìm nhóm được chọn
    const selectedGroupData = availableGroups.find(
      (g) => g.programId === Number(selectedGroup)
    );
    
    if (!selectedGroupData || selectedGroupData.interns.length === 0) {
      toast.error("Nhóm không hợp lệ hoặc không có thành viên.");
      return;
    }

    console.log("Assigning mentor to group:", selectedGroupData);

    try {
      // Phân công mentor cho tất cả intern trong nhóm
      const assignmentPromises = selectedGroupData.interns.map((intern) =>
        assignMentor({
          mentorId: Number(selectedMentor),
          internId: intern.intern_id,
        })
      );
      
      const results = await Promise.all(assignmentPromises);
      
      console.log("Assignment results:", results);
      
      // Kiểm tra xem có lỗi nào không
      const failedAssignments = results.filter((r) => !r.success);
      
      if (failedAssignments.length === 0) {
        toast.success(
          `Phân công thành công cho ${selectedGroupData.interns.length} thực tập sinh!`
        );
        onAssignmentCreated();
        onClose();
      } else if (failedAssignments.length < results.length) {
        toast.warning(
          `Phân công thành công cho ${results.length - failedAssignments.length}/${results.length} thực tập sinh.`
        );
        onAssignmentCreated();
        onClose();
      } else {
        toast.error("Phân công thất bại cho tất cả thực tập sinh.");
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
            <label htmlFor="group-select">Chọn Nhóm</label>
            <select
              id="group-select"
              className="form-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="" disabled>
                -- Chọn một nhóm --
              </option>
              {availableGroups.map((group) => (
                <option key={group.programId} value={group.programId}>
                  {group.programTitle} ({group.interns.length} thành viên)
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
