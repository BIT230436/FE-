import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDepartmentsByProgram,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getMentorsByDepartment,
  addMentorToDepartment,
  updateMentorDepartment,
  removeMentorFromDepartment,
} from "../../services/departmentService";

import { getMentors } from "../../services/mentorService";
import MentorSelectionModal from "../../components/common/MentorSelectionModal";

import "./DepartmentManagement.css";

export default function DepartmentManagement() {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [filterText, setFilterText] = useState("");

  // States cho mentor
  const [showAddMentorModal, setShowAddMentorModal] = useState(false);
  const [showMoveMentorModal, setShowMoveMentorModal] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);

  // Lấy danh sách department theo program
  useEffect(() => {
    if (!programId) {
      toast.error("Vui lòng truy cập qua một chương trình cụ thể.");
      navigate("/hr/internship-programs");
    } else {
      loadDepartmentsAndMentors(programId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  async function loadDepartmentsAndMentors(progId) {
    try {
      setLoading(true);
      const depts = await getDepartmentsByProgram(progId);

      const mentorPromises = depts.map((dept) =>
        getMentorsByDepartment(dept.id)
      );
      const mentorsData = await Promise.all(mentorPromises);

      const combined = depts.map((dept, i) => ({
        ...dept,
        mentors: mentorsData[i] || [],
      }));

      setDepartments(combined);
    } catch (error) {
      console.error("Failed to load departments & mentors:", error);
      toast.error("Không thể tải dữ liệu phòng ban và mentor.");
    } finally {
      setLoading(false);
    }
  }

  async function reloadData() {
    if (programId) await loadDepartmentsAndMentors(programId);
  }

  // Tạo phòng ban
  const handleCreate = async (data) => {
    try {
      const payload = {
        nameDepartment: data.name,
        capacity: data.capacity ?? null,
      };

      await createDepartment(programId, payload);
      toast.success("Tạo phòng ban thành công!");
      setShowCreateModal(false);
      await reloadData();
    } catch (error) {
      console.error("Failed to create department:", error);
      toast.error("Lỗi khi tạo phòng ban!");
    }
  };

  // Cập nhật phòng ban
  const handleUpdate = async (id, data) => {
    try {
      const payload = {
        nameDepartment: data.name,
        description: data.description,
        capacity: data.capacity ?? null,
      };

      await updateDepartment(id, payload);
      toast.success("Cập nhật thành công!");
      setEditingDepartment(null);
      await reloadData();
    } catch (error) {
      console.error("Failed to update department:", error);
      toast.error("Lỗi khi cập nhật phòng ban!");
    }
  };

  // Xóa phòng ban
  const handleDeleteDepartment = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này không?")) {
      try {
        await deleteDepartment(id);
        toast.success("Đã xóa phòng ban!");
        await reloadData();
      } catch (error) {
        console.error("Failed to delete department:", error);
        toast.error("Không thể xóa phòng ban này.");
      }
    }
  };

  // Thêm mentor vào department
  const handleAddMentor = async (departmentId, mentorId) => {
    try {
      await addMentorToDepartment(departmentId, mentorId);
      toast.success("Đã thêm mentor vào phòng ban!");
      setShowAddMentorModal(false);
      setSelectedDepartmentId(null);
      await reloadData();
    } catch (error) {
      console.error("Failed to add mentor:", error);
      toast.error("Không thể thêm mentor vào phòng ban.");
    }
  };

  // Chuyển mentor sang department khác
  const handleMoveMentor = async (mentorId, newDepartmentId) => {
    try {
      await updateMentorDepartment(mentorId, newDepartmentId);
      toast.success("Đã chuyển mentor sang phòng ban mới!");
      setShowMoveMentorModal(false);
      setSelectedMentor(null);
      await reloadData();
    } catch (error) {
      console.error("Failed to move mentor:", error);
      toast.error("Không thể chuyển mentor.");
    }
  };

  // Xóa mentor khỏi department
  const handleRemoveMentor = async (mentorId) => {
    if (window.confirm("Xóa mentor này khỏi phòng ban?")) {
      try {
        await removeMentorFromDepartment(mentorId);
        toast.success("Đã xóa mentor khỏi phòng ban!");
        await reloadData();
      } catch (error) {
        console.error("Failed to remove mentor:", error);
        toast.error("Không thể xóa mentor.");
      }
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    (dept.departmentName || "").toLowerCase().includes(filterText.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Đang tải...</div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/hr/internship-programs")}
            style={{ marginBottom: 8 }}
          >
            ← Quay lại danh sách chương trình
          </button>
          <h1 className="page-title">Quản lý Phòng ban & Mentor</h1>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          + Thêm phòng ban
        </button>
      </div>

      <div className="card">
        <div className="card-padding">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Tìm kiếm theo tên phòng ban..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {filteredDepartments.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
            {filterText
              ? "Không tìm thấy phòng ban nào."
              : "Chưa có phòng ban nào trong chương trình này."}
          </div>
        ) : (
          <table className="dept-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên phòng ban</th>
                <th>Mentor</th>
                <th>Sức chứa</th>
                <th>Người tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept, index) => (
                <tr key={dept.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{dept.departmentName}</strong>
                  </td>
                  <td>
                    {dept.mentors?.length > 0 ? (
                      dept.mentors.map((m) => (
                        <div key={m.id} className="mentor-item">
                          <span>👨‍🏫 {m.name || m.fullName}</span>
                          <div>
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => {
                                setSelectedMentor(m);
                                setShowMoveMentorModal(true);
                              }}
                              title="Chuyển sang phòng ban khác"
                            >
                              🔄
                            </button>
                            <button
                              className="btn btn-outline btn-xs"
                              style={{ marginLeft: 4 }}
                              onClick={() => handleRemoveMentor(m.id)}
                              title="Xóa khỏi phòng ban"
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <em style={{ color: "#999" }}>(Chưa có mentor)</em>
                    )}
                    <button
                      className="btn btn-primary mentor-button"
                      onClick={() => {
                        setSelectedDepartmentId(dept.id);
                        setShowAddMentorModal(true);
                      }}
                    >
                      Thêm mentor
                    </button>
                  </td>
                  <td>{dept.capacity ?? "—"}</td>
                  <td>{dept.hrName || "Không rõ"}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setEditingDepartment(dept)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteDepartment(dept.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal tạo/sửa department */}
      {showCreateModal && (
        <DepartmentModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}

      {editingDepartment && (
        <DepartmentModal
          department={editingDepartment}
          onClose={() => setEditingDepartment(null)}
          onSave={(data) => handleUpdate(editingDepartment.id, data)}
        />
      )}

      {/* Modal thêm mentor */}
      {showAddMentorModal && (
        <MentorSelectionModal
          onClose={() => {
            setShowAddMentorModal(false);
            setSelectedDepartmentId(null);
          }}
          onSelect={(mentor) => {
            handleAddMentor(selectedDepartmentId, mentor.id);
            setShowAddMentorModal(false);
            setSelectedDepartmentId(null);
          }}
        />
      )}

      {/* Modal chuyển mentor */}
      {showMoveMentorModal && selectedMentor && (
        <MoveMentorModal
          mentor={selectedMentor}
          departments={departments}
          onClose={() => {
            setShowMoveMentorModal(false);
            setSelectedMentor(null);
          }}
          onMove={handleMoveMentor}
        />
      )}
    </div>
  );
}

// ===================== DepartmentModal =====================
function DepartmentModal({ department, onClose, onSave }) {
  const [name, setName] = useState(department?.departmentName || "");
  const [capacity, setCapacity] = useState(department?.capacity ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Tên phòng ban không được để trống.");

    try {
      setIsSubmitting(true);
      await onSave({
        name: name.trim(),
        capacity: capacity ? parseInt(capacity, 10) : null,
      });
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {department ? " Sửa phòng ban" : " Tạo phòng ban mới"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên phòng ban *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Sức chứa</label>
            <input
              type="number"
              className="form-input"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : " Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
DepartmentModal.propTypes = {
  department: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

// ===================== AddMentorModal =====================
function AddMentorModal({ departmentId, onClose, onAdd }) {
  const [mentorId, setMentorId] = useState("");
  const [availableMentors, setAvailableMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lấy danh sách mentor khi modal mở
  useEffect(() => {
    async function fetchMentors() {
      setLoadingMentors(true);
      try {
        const response = await getMentors();
        // Handle nếu API trả về mảng hoặc object có content
        const mentors = Array.isArray(response)
          ? response
          : response.content || [];

        setAvailableMentors(
          mentors.map((m) => ({
            id: m.id,
            name: m.name || m.fullName || "Unknown",
            email: m.email || "N/A",
          }))
        );
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
        toast.error("Không thể tải danh sách mentor.");
      } finally {
        setLoadingMentors(false);
      }
    }
    fetchMentors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mentorId) {
      return toast.error("Vui lòng chọn một mentor.");
    }

    try {
      setIsSubmitting(true);
      // mentorId đã là ID của mentor được chọn
      await onAdd(departmentId, mentorId);
    } catch (error) {
      console.error("Add mentor error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Thêm mentor vào phòng ban</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chọn Mentor *</label>
            {loadingMentors ? (
              <div className="loading-text">Đang tải danh sách mentor...</div>
            ) : (
              <select
                className="form-input"
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">-- Chọn mentor --</option>
                {availableMentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name} - {mentor.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



function MoveMentorModal({ mentor, departments, onClose, onMove }) {
  const [newDepartmentId, setNewDepartmentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newDepartmentId) {
      return toast.error("Vui lòng chọn phòng ban đích.");
    }

    try {
      setIsSubmitting(true);
      await onMove(mentor.id, newDepartmentId);
    } catch (error) {
      console.error("Move mentor error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">🔄 Chuyển mentor sang phòng ban khác</h2>

        <div className="mentor-info">
          <strong>Mentor:</strong> {mentor.name || mentor.fullName}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chọn phòng ban đích *</label>
            <select
              className="form-input"
              value={newDepartmentId}
              onChange={(e) => setNewDepartmentId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">-- Chọn phòng ban --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName} ({dept.mentors?.length || 0} mentor)
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "🔄 Chuyển"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
MoveMentorModal.propTypes = {
  mentor: PropTypes.object.isRequired,
  departments: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onMove: PropTypes.func.isRequired,
};
