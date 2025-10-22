import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../../services/departmentService";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      setLoading(true);
      const data = await getAllDepartments();
      setDepartments(data || []);
    } catch (error) {
      console.error("Failed to load departments:", error);
      toast.error("Không thể tải danh sách phòng ban.");
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (data) => {
    try {
      await createDepartment(null, { departmentName: data.name, description: data.description });
      toast.success("Tạo phòng ban thành công!");
      setShowCreateModal(false);
      loadDepartments();
    } catch (error) {
      console.error("Failed to create department:", error);
      toast.error("Lỗi khi tạo phòng ban.");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateDepartment(id, { nameDepartment: data.name, description: data.description });
      toast.success("Cập nhật phòng ban thành công!");
      setEditingDepartment(null);
      loadDepartments();
    } catch (error) {
      console.error("Failed to update department:", error);
      toast.error("Lỗi khi cập nhật phòng ban.");
    }
  };

  const handleDelete = async (id) => {
    if (globalThis.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
      try {
        await deleteDepartment(id);
        toast.success("Xóa phòng ban thành công!");
        loadDepartments();
      } catch (error) {
        console.error("Failed to delete department:", error);
        toast.error("Lỗi khi xóa phòng ban.");
      }
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.nameDepartment?.toLowerCase().includes(filterText.toLowerCase())
  );

  if (loading) {
    return <div className="loading center">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <ToastContainer />
      <div className="page-header">
        <h1 className="page-title">Quản lý Phòng ban</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          Thêm phòng ban mới
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ padding: 16 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Lọc theo tên phòng ban..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">STT</th>
              <th className="table-th">Tên phòng ban</th>
              <th className="table-th">Mô tả</th>
              <th className="table-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept, index) => (
              <tr key={dept.id}>
                <td className="table-td">{index + 1}</td>
                <td className="table-td">{dept.nameDepartment}</td>
                <td className="table-td">{dept.description}</td>
                <td className="table-td">
                  <button
                    className="btn btn-warning btn-sm"
                    style={{ marginRight: 8 }}
                    onClick={() => setEditingDepartment(dept)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(dept.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

function DepartmentModal({ department, onClose, onSave }) {
  const [name, setName] = useState(department?.nameDepartment || "");
  const [description, setDescription] = useState(department?.description || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Tên phòng ban không được để trống.");
      return;
    }
    onSave({ name, description });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">
          {department ? "Sửa phòng ban" : "Tạo phòng ban mới"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="departmentName">
              Tên phòng ban
            </label>
            <input
              id="departmentName"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="departmentDescription">
              Mô tả
            </label>
            <textarea
              id="departmentDescription"
              className="form-input"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
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

DepartmentModal.propTypes = {
  department: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nameDepartment: PropTypes.string,
    description: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
