import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthStore } from "../../store/authStore";

import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../../services/programService";

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
        toast.error("Không thể tải danh sách chương trình!");
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  // ➕ Tạo chương trình
  const handleCreateProgram = async (newProgramData) => {
    const { userId, ...programData } = newProgramData;

    console.log("Creating program with data:", {
      programData,
      userId,
    });

    try {
      await createProgram(programData, userId);
      toast.success("Tạo chương trình thành công! 🎉");
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
      await updateProgram(updatedData.id, updatedData);
      toast.success("Cập nhật chương trình thành công! ✅");
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa chương trình này không?")) {
      return;
    }

    try {
      await deleteProgram(id);
      toast.success("Đã xóa chương trình thành công! 🗑️");
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
    return <div className="loading center">Đang tải...</div>;
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
          Tạo chương trình mới
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
                  Chưa có chương trình nào.
                </td>
              </tr>
            ) : (
              programs.map((program, index) => (
                <tr key={program.id}>
                  <td className="table-td">{index + 1}</td>
                  <td className="table-td">{program.programName}</td>
                  <td className="table-td">{program.dateCreate}</td>
                  <td className="table-td">{program.dateEnd}</td>
                  <td className="table-td">{program.description}</td>
                  <td className="table-td">{program.hrName || "Không rõ"}</td>
                  <td className="table-td">
                    <button
                      className="btn btn-success"
                      style={{ marginRight: 8 }}
                      onClick={() => setViewing(program)}
                    >
                      Xem
                    </button>
                    <button
                      className="btn btn-warning"
                      onClick={() => setEditing(program)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-warning"
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

function CreateProgramModal({ onClose, onCreate }) {
  const user = useAuthStore((state) => state.user);

  const [programName, setProgramName] = useState("");
  const [dateCreate, setDateCreate] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [description, setDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    console.log("Current user from store:", user);
  }, [user]);

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

    // ✅ Lấy user.id từ Zustand
    const userId = user?.id;

    console.log("Submitting with userId:", userId);
    console.log("User object:", user);

    if (!userId) {
      toast.error(
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!"
      );
      return;
    }

    // ✅ Payload - Đảm bảo format đúng cho backend
    const payload = {
      programName: programName.trim(),
      dateCreate: dateCreate,
      dateEnd: dateEnd,
      description: description.trim(),
      userId,
    };

    console.log("=== PAYLOAD DEBUG ===");
    console.log("Full payload:", JSON.stringify(payload, null, 2));
    console.log(
      "dateCreate type:",
      typeof payload.dateCreate,
      "value:",
      payload.dateCreate
    );
    console.log(
      "dateEnd type:",
      typeof payload.dateEnd,
      "value:",
      payload.dateEnd
    );
    console.log("====================");

    onCreate(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Tạo chương trình thực tập mới</h2>
        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Mô tả *</label>
            <textarea
              className={`form-input ${
                validationErrors.description ? "input-error" : ""
              }`}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {validationErrors.description && (
              <div className="error-message">
                {validationErrors.description}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Tạo
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

function ViewProgramModal({ program, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Chi tiết chương trình</h2>
        <div className="form-group">
          <label>Tên chương trình</label>
          <div>{program.programName}</div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Ngày bắt đầu</label>
            <div>{program.dateCreate}</div>
          </div>
          <div className="form-group">
            <label>Ngày kết thúc</label>
            <div>{program.dateEnd}</div>
          </div>
        </div>
        <div className="form-group">
          <label>Mô tả</label>
          <div>{program.description}</div>
        </div>
        <div className="form-group">
          <label>Người khởi tạo</label>
          <div>{program.hrName || "Không rõ"}</div>
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

//
// ✏️ MODAL CHỈNH SỬA
//
function EditProgramModal({ program, onClose, onSave }) {
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

    onSave({
      ...program,
      programName: programName.trim(),
      dateCreate,
      dateEnd,
      description: description.trim(),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Chỉnh sửa chương trình</h2>
        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Mô tả *</label>
            <textarea
              className={`form-input ${
                validationErrors.description ? "input-error" : ""
              }`}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {validationErrors.description && (
              <div className="error-message">
                {validationErrors.description}
              </div>
            )}
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