import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDepartmentsByProgram,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentService";

export default function DepartmentManagement() {
  const { programId } = useParams();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (!programId) {
      console.error("Lỗi: programId không được cung cấp.");
      toast.error("Vui lòng truy cập qua một chương trình thực tập cụ thể.");
      navigate("/hr/internship-programs");
    }
  }, [programId, navigate]);

  useEffect(() => {
    if (programId) loadDepartmentsByProgram(programId);
  }, [programId]);

  async function loadDepartmentsByProgram(progId) {
    try {
      setLoading(true);
      const data = await getDepartmentsByProgram(progId);
      setDepartments(data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
      toast.error("Không thể tải danh sách phòng ban.");
    } finally {
      setLoading(false);
    }
  }

  async function reloadDepartments() {
    if (programId) await loadDepartmentsByProgram(programId);
  }

  // ➕ Tạo phòng ban - FIXED: match với backend
  const handleCreate = async (data) => {
    try {
      const payload = {
        nameDepartment: data.name,
        capacity: data.capacity || null,
      };

      await createDepartment(programId, payload);
      toast.success("Tạo phòng ban thành công!");
      setShowCreateModal(false);
      await reloadDepartments();
    } catch (error) {
      console.error("Failed to create department:", error);
      if (error.response?.status === 401)
        toast.error("Bạn chưa đăng nhập hoặc phiên đã hết hạn!");
      else
        toast.error(
          error.response?.data?.message ||
            "Lỗi khi tạo phòng ban. Vui lòng thử lại."
        );
    }
  };

  // ✏️ Cập nhật phòng ban - FIXED: match với backend
  const handleUpdate = async (id, data) => {
    try {
      const payload = {
        nameDepartment: data.name, // Backend expects "nameDepartment"
        description: data.description,
        capacity: data.capacity || null,
      };

      console.log("=== DEBUG UPDATE DEPARTMENT ===");
      console.log("Department ID:", id);
      console.log("Payload gửi đi:", payload);
      console.log("================================");

      await updateDepartment(id, payload);
      toast.success("Cập nhật phòng ban thành công!");
      setEditingDepartment(null);
      await reloadDepartments();
    } catch (error) {
      console.error("Failed to update department:", error);
      toast.error(
        error.response?.data?.message ||
          "Lỗi khi cập nhật phòng ban. Vui lòng thử lại."
      );
    }
  };

  // 🗑️ Xóa phòng ban
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
      try {
        await deleteDepartment(id);
        toast.success("Xóa phòng ban thành công!");
        await reloadDepartments();
      } catch (error) {
        console.error("Failed to delete department:", error);
        toast.error(
          error.response?.data?.message ||
            "Lỗi khi xóa phòng ban. Vui lòng thử lại."
        );
      }
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.departmentName?.toLowerCase().includes(filterText.toLowerCase())
  );

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Đang tải...</div>
    );

  if (!programId)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Đang xác thực chương trình...
      </div>
    );

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page-header">
        <div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/hr/internship-programs")}
            style={{ marginBottom: 8 }}
          >
            ← Quay lại danh sách chương trình
          </button>
          <h1 className="page-title">
            Quản lý Phòng ban (Chương trình ID: {programId})
          </h1>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          + Thêm phòng ban mới
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: 16 }}>
          <input
            type="text"
            className="form-input"
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
              ? "Không tìm thấy phòng ban nào phù hợp."
              : "Chưa có phòng ban nào trong chương trình này. Hãy thêm phòng ban mới."}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên phòng ban</th>
                <th>Sức chứa</th>
                <th>Người tạo</th>
                <th style={{ textAlign: "center" }}>Hành động</th>
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
                    {dept.capacity ?? <em style={{ color: "#999" }}>—</em>}
                  </td>
                  <td>
                    {dept.hrName || <em style={{ color: "#999" }}>Không rõ</em>}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-warning btn-sm"
                      style={{ marginRight: 8 }}
                      onClick={() => setEditingDepartment(dept)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(dept.id)}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
    </div>
  );
}

// Modal component - FIXED: sử dụng "name" thay vì "departmentName"
function DepartmentModal({ department, onClose, onSave }) {
  const [name, setName] = useState(department?.departmentName || "");
  const [capacity, setCapacity] = useState(department?.capacity || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Tên phòng ban không được để trống.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Pass data với key "name" để handleCreate/handleUpdate convert thành "nameDepartment"
      await onSave({
        name: name.trim(),
        capacity: capacity ? parseInt(capacity) : null,
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
          {department ? "✏️ Sửa phòng ban" : "➕ Tạo phòng ban mới"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Tên phòng ban <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên phòng ban..."
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sức chứa</label>
            <input
              type="number"
              className="form-input"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Nhập sức chứa (nếu có)..."
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
              {isSubmitting ? "Đang xử lý..." : "💾 Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

DepartmentModal.propTypes = {
  department: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    departmentName: PropTypes.string,
    description: PropTypes.string,
    capacity: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
