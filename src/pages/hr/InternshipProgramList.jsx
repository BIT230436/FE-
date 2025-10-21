import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// ✅ Đã sử dụng: useAuthStore
import { useAuthStore } from "../../store/authStore";

// ✅ Đã sử dụng: Các service API
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../../services/programService";

import { getDepartmentsByProgram } from "../../services/departmentService";

// ==========================================================
// 🚀 1. COMPONENT CHÍNH: InternshipProgramList
// ==========================================================
export default function InternshipProgramList() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  // 📥 Load danh sách chương trình từ API
  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await getAllPrograms();
        setPrograms(data);
      } catch (error) {
        console.error("Load programs error:", error);
        toast.error("Không thể tải danh sách chương trình! Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  // ➕ Tạo chương trình
  const handleCreateProgram = async (newProgramData) => {
    const { userId, ...programData } = newProgramData;

    try {
      await createProgram(programData, userId);
      toast.success("Tạo chương trình thành công! 🎉");
      // Tải lại danh sách
      const data = await getAllPrograms();
      setPrograms(data);
      setShowCreate(false);
    } catch (error) {
      console.error("Create program error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo chương trình!";
      toast.error(errorMsg);
    }
  };

  // ✏️ Cập nhật chương trình
  const handleUpdateProgram = async (updatedData) => {
    try {
      // API call: updateProgram(id, data)
      await updateProgram(updatedData.id, updatedData);
      toast.success("Cập nhật chương trình thành công! ✅");
      // Tải lại danh sách
      const data = await getAllPrograms();
      setPrograms(data);
      setEditing(null);
    } catch (error) {
      console.error("Update program error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật chương trình!";
      toast.error(errorMsg);
    }
  };

  // 🗑️ Xóa chương trình
  const handleDeleteProgram = async (id) => {
    if (
      !window.confirm(
        "⚠️ Bạn có chắc chắn muốn xóa chương trình này không? Hành động này không thể hoàn tác."
      )
    ) {
      return;
    }

    try {
      await deleteProgram(id);
      toast.success("Đã xóa chương trình thành công! 🗑️");
      // Tải lại danh sách
      const data = await getAllPrograms();
      setPrograms(data);
    } catch (error) {
      console.error("Delete program error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa chương trình!";
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="loading center">Đang tải danh sách chương trình...</div>
    );
  }

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="page-header">
        <h1 className="page-title">Chương trình Thực tập</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          ➕ Tạo chương trình mới
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">STT</th>
              <th className="table-th">Tên chương trình</th>
              <th className="table-th">Ngày bắt đầu</th>
              <th className="table-th">Ngày kết thúc</th>
              <th className="table-th">Mô tả</th>
              <th className="table-th">Người khởi tạo</th>
              <th className="table-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 ? (
              <tr>
                <td className="table-td center" colSpan={7}>
                  Chưa có chương trình nào. Hãy tạo một chương trình mới.
                </td>
              </tr>
            ) : (
              programs.map((program, index) => (
                <tr key={program.id}>
                  <td className="table-td">{index + 1}</td>
                  <td className="table-td">{program.programName}</td>
                  <td className="table-td">{program.dateCreate}</td>
                  <td className="table-td">{program.dateEnd}</td>
                  <td className="table-td text-truncate">
                    {program.description}
                  </td>
                  <td className="table-td">{program.hrName || "Không rõ"}</td>
                  <td className="table-td action-buttons">
                    {/* ✅ Gán program object vào state viewing */}
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setViewing(program)}
                    >
                      Chi tiết P.Ban
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setEditing(program)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm" // ⚠️ Đã đổi màu sang đỏ cho hành động xóa
                      onClick={() => handleDeleteProgram(program.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateProgramModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateProgram}
        />
      )}

      {/* ✅ Modal View nhận program object, bao gồm cả program.id */}
      {viewing && (
        <ViewProgramModal program={viewing} onClose={() => setViewing(null)} />
      )}

      {editing && (
        <EditProgramModal
          program={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdateProgram}
        />
      )}
    </div>
  );
}

// ==========================================================
// ➕ 2. MODAL TẠO CHƯƠNG TRÌNH: CreateProgramModal
// ==========================================================
function CreateProgramModal({ onClose, onCreate }) {
  const user = useAuthStore((state) => state.user);

  const [programName, setProgramName] = useState("");
  const [dateCreate, setDateCreate] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [description, setDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!programName.trim())
      errors.programName = "Tên chương trình không được để trống";
    if (!dateCreate) errors.dateCreate = "Ngày bắt đầu không được để trống";
    if (!dateEnd) errors.dateEnd = "Ngày kết thúc không được để trống";
    else if (new Date(dateEnd) < new Date(dateCreate))
      errors.dateEnd = "Ngày kết thúc phải sau ngày bắt đầu";

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    const userId = user?.id; // Lấy userId từ Zustand

    if (!userId) {
      toast.error(
        "Lỗi xác thực: Không tìm thấy ID người dùng. Vui lòng đăng nhập lại!"
      );
      return;
    }

    const payload = {
      programName: programName.trim(),
      dateCreate: dateCreate, // Định dạng YYYY-MM-DD
      dateEnd: dateEnd, // Định dạng YYYY-MM-DD
      description: description.trim(),
      userId, // ID của người tạo (HR)
    };

    onCreate(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Tạo chương trình thực tập mới</h2>
        <form onSubmit={handleSubmit}>
          {/* Tên chương trình */}
          <div className="form-group">
            <label>Tên chương trình *</label>
            <input
              className={`form-input ${
                validationErrors.programName ? "input-error" : ""
              }`}
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            />
            {validationErrors.programName && (
              <div className="error-message">
                {validationErrors.programName}
              </div>
            )}
          </div>

          {/* Ngày bắt đầu & Ngày kết thúc */}
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu *</label>
              <input
                type="date"
                className={`form-input ${
                  validationErrors.dateCreate ? "input-error" : ""
                }`}
                value={dateCreate}
                onChange={(e) => setDateCreate(e.target.value)}
              />
              {validationErrors.dateCreate && (
                <div className="error-message">
                  {validationErrors.dateCreate}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Ngày kết thúc *</label>
              <input
                type="date"
                className={`form-input ${
                  validationErrors.dateEnd ? "input-error" : ""
                }`}
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
              {validationErrors.dateEnd && (
                <div className="error-message">{validationErrors.dateEnd}</div>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Tạo chương trình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CreateProgramModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

// ==========================================================
// 🔎 3. MODAL XEM CHI TIẾT: ViewProgramModal
// ==========================================================
function ViewProgramModal({ program, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Gọi API lấy departments khi mở modal
  // ✅ program.id được sử dụng TẠI ĐÂY
  useEffect(() => {
    async function loadDepartments() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching departments for program ID:", program.id);
        const data = await getDepartmentsByProgram(program.id);
        setDepartments(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải departments:", err);
        setError("Không thể tải danh sách phòng ban.");
      } finally {
        setLoading(false);
      }
    }
    loadDepartments();
  }, [program.id]); // Dependency array đảm bảo chỉ gọi khi program.id thay đổi

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          Chi tiết chương trình: {program.programName}
        </h2>
        <div className="modal-content-scroll">
          {" "}
          {/* Thêm scroll cho nội dung */}
          <div className="form-group">
            <label>Tên chương trình</label>
            <div className="detail-value">{program.programName}</div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <div className="detail-value">{program.dateCreate}</div>
            </div>
            <div className="form-group">
              <label>Ngày kết thúc</label>
              <div className="detail-value">{program.dateEnd}</div>
            </div>
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <div className="detail-value text-pre-wrap">
              {program.description || "Không có mô tả"}
            </div>
          </div>
          <div className="form-group">
            <label>Người khởi tạo</label>
            <div className="detail-value">{program.hrName || "Không rõ"}</div>
          </div>
          {/* 🔹 Danh sách Department */}
          <div className="form-group section-title">
            <h3
              style={{
                marginBottom: "5px",
                borderBottom: "1px solid #eee",
                paddingBottom: "5px",
              }}
            >
              Phòng ban thuộc chương trình
            </h3>
            {loading ? (
              <div className="loading center">Đang tải phòng ban...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : departments.length === 0 ? (
              <div className="info-message">
                Chưa có phòng ban nào trong chương trình này.
              </div>
            ) : (
              <ul className="department-list">
                {departments.map((d) => (
                  <li key={d.id} className="department-item">
                    <strong>{d.departmentName}</strong>
                    {d.description && (
                      <div className="text-sm">{d.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

ViewProgramModal.propTypes = {
  program: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

// ==========================================================
// ✏️ 4. MODAL CHỈNH SỬA: EditProgramModal
// ==========================================================
function EditProgramModal({ program, onClose, onSave }) {
  // Lấy giá trị hiện tại của program để khởi tạo state
  const [programName, setProgramName] = useState(program.programName);
  const [dateCreate, setDateCreate] = useState(program.dateCreate);
  const [dateEnd, setDateEnd] = useState(program.dateEnd);
  const [description, setDescription] = useState(program.description);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!programName.trim())
      errors.programName = "Tên chương trình không được để trống";
    if (!dateCreate) errors.dateCreate = "Ngày bắt đầu không được để trống";
    if (!dateEnd) errors.dateEnd = "Ngày kết thúc không được để trống";
    else if (new Date(dateEnd) < new Date(dateCreate))
      errors.dateEnd = "Ngày kết thúc phải sau ngày bắt đầu";

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập.");
      return;
    }

    // Gửi dữ liệu đã cập nhật, bao gồm cả id
    onSave({
      id: program.id, // Đảm bảo ID được gửi đi để cập nhật
      programName: programName.trim(),
      dateCreate,
      dateEnd,
      description: description.trim(),
      // Giữ lại các trường khác (như hrId) nếu cần
      hrId: program.hrId, // Hoặc thông tin người tạo cũ
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Chỉnh sửa chương trình</h2>
        <form onSubmit={handleSubmit}>
          {/* Tên chương trình */}
          <div className="form-group">
            <label>Tên chương trình *</label>
            <input
              className={`form-input ${
                validationErrors.programName ? "input-error" : ""
              }`}
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            />
            {validationErrors.programName && (
              <div className="error-message">
                {validationErrors.programName}
              </div>
            )}
          </div>

          {/* Ngày bắt đầu & Ngày kết thúc */}
          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu *</label>
              <input
                type="date"
                className={`form-input ${
                  validationErrors.dateCreate ? "input-error" : ""
                }`}
                value={dateCreate}
                onChange={(e) => setDateCreate(e.target.value)}
              />
              {validationErrors.dateCreate && (
                <div className="error-message">
                  {validationErrors.dateCreate}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Ngày kết thúc *</label>
              <input
                type="date"
                className={`form-input ${
                  validationErrors.dateEnd ? "input-error" : ""
                }`}
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
              {validationErrors.dateEnd && (
                <div className="error-message">{validationErrors.dateEnd}</div>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditProgramModal.propTypes = {
  program: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
