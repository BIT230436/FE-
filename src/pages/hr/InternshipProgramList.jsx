import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./InternshipProgramList.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Mock data for now
const mockPrograms = [
  {
    id: 1,
    name: "Chương trình thực tập Hè 2024",
    department: "Công nghệ thông tin",
    quantity: 10,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    status: "opening",
  },
  {
    id: 2,
    name: "Thực tập sinh Marketing Quý 3",
    department: "Marketing",
    quantity: 5,
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    status: "closed",
  },
];

export default function InternshipProgramList() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    // In the future, we will call a service to get programs
    setTimeout(() => {
      setPrograms(mockPrograms);
      setLoading(false);
    }, 500);
  }, []);

  const handleCreateProgram = (newProgramData) => {
    const newProgram = {
      ...newProgramData,
      id: Date.now(), // Use timestamp as a temporary unique ID
    };
    setPrograms([newProgram, ...programs]);
    setShowCreate(false);
    toast.success("Tạo chương trình thành công! 🎉");
  };

  const handleUpdateProgram = (updatedData) => {
    setPrograms(
      programs.map((p) => (p.id === updatedData.id ? updatedData : p))
    );
    setEditing(null);
    toast.success("Cập nhật chương trình thành công! ✅");
  };

  if (loading) {
    return <div className="loading center">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={5000} />

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
              <th className="table-th">Phòng ban</th>
              <th className="table-th">Số lượng</th>
              <th className="table-th">Thời gian</th>
              <th className="table-th">Trạng thái</th>
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
                  <td className="table-td">{program.name}</td>
                  <td className="table-td">{program.department}</td>
                  <td className="table-td">{program.quantity}</td>
                  <td className="table-td">
                    {program.startDate} - {program.endDate}
                  </td>
                  <td className="table-td">
                    <span
                      className={`badge ${
                        program.status === "opening"
                          ? "badge-success"
                          : "badge-danger"
                      }`}
                    >
                      {program.status === "opening" ? "Đang mở" : "Đã đóng"}
                    </span>
                  </td>
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
                      style={{ marginRight: 8 }}
                      onClick={() => setEditing(program)}
                    >
                      Sửa
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
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Tên chương trình không được để trống";
    if (!department.trim()) errors.department = "Phòng ban không được để trống";
    if (!quantity || Number.isNaN(quantity) || Number.parseInt(quantity) <= 0)
      errors.quantity = "Số lượng phải là một số dương";
    if (!startDate) errors.startDate = "Ngày bắt đầu không được để trống";
    if (!endDate) errors.endDate = "Ngày kết thúc không được để trống";
    else if (startDate && endDate && new Date(startDate) > new Date(endDate))
      errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";

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

    onCreate({
      name: name.trim(),
      department: department.trim(),
      quantity: Number.parseInt(quantity),
      startDate,
      endDate,
      status: "opening", // Default status
    });
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Tạo chương trình thực tập mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Tên chương trình <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="name"
              className={`form-input ${validationErrors.name ? "input-error" : ""}`}
              value={name}
              onChange={handleInputChange(setName, "name")}
            />
            {validationErrors.name && (
              <div className="error-message">{validationErrors.name}</div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="department">
                Phòng ban <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="department"
                className={`form-input ${
                  validationErrors.department ? "input-error" : ""
                }`}
                value={department}
                onChange={handleInputChange(setDepartment, "department")}
              />
              {validationErrors.department && (
                <div className="error-message">{validationErrors.department}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="quantity">
                Số lượng <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="quantity"
                type="number"
                className={`form-input ${
                  validationErrors.quantity ? "input-error" : ""
                }`}
                value={quantity}
                onChange={handleInputChange(setQuantity, "quantity")}
              />
              {validationErrors.quantity && (
                <div className="error-message">{validationErrors.quantity}</div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="start">
                Ngày bắt đầu <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="start"
                type="date"
                className={`form-input ${
                  validationErrors.startDate ? "input-error" : ""
                }`}
                value={startDate}
                onChange={handleInputChange(setStartDate, "startDate")}
              />
              {validationErrors.startDate && (
                <div className="error-message">{validationErrors.startDate}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="end">
                Ngày kết thúc <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="end"
                type="date"
                className={`form-input ${
                  validationErrors.endDate ? "input-error" : ""
                }`}
                value={endDate}
                onChange={handleInputChange(setEndDate, "endDate")}
              />
              {validationErrors.endDate && (
                <div className="error-message">{validationErrors.endDate}</div>
              )}
            </div>
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
          <label className="form-label">Tên chương trình</label>
          <div>{program.name}</div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phòng ban</label>
            <div>{program.department}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Số lượng</label>
            <div>{program.quantity}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Thời gian</label>
            <div>
              {program.startDate} - {program.endDate}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <div>{program.status === "opening" ? "Đang mở" : "Đã đóng"}</div>
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

function EditProgramModal({ program, onClose, onSave }) {
  const [name, setName] = useState(program.name);
  const [department, setDepartment] = useState(program.department);
  const [quantity, setQuantity] = useState(program.quantity);
  const [startDate, setStartDate] = useState(program.startDate);
  const [endDate, setEndDate] = useState(program.endDate);
  const [status, setStatus] = useState(program.status);
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Tên chương trình không được để trống";
    if (!department.trim()) errors.department = "Phòng ban không được để trống";
    if (!quantity || Number.isNaN(quantity) || Number.parseInt(quantity) <= 0)
      errors.quantity = "Số lượng phải là một số dương";
    if (!startDate) errors.startDate = "Ngày bắt đầu không được để trống";
    if (!endDate) errors.endDate = "Ngày kết thúc không được để trống";
    else if (startDate && endDate && new Date(startDate) > new Date(endDate))
      errors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
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
      name: name.trim(),
      department: department.trim(),
      quantity: Number.parseInt(quantity),
      startDate,
      endDate,
      status,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Chỉnh sửa chương trình</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên chương trình</label>
            <input
              className={`form-input ${validationErrors.name ? "input-error" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {validationErrors.name && (
              <div className="error-message">{validationErrors.name}</div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phòng ban</label>
              <input
                className={`form-input ${
                  validationErrors.department ? "input-error" : ""
                }`}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
              {validationErrors.department && (
                <div className="error-message">{validationErrors.department}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Số lượng</label>
              <input
                type="number"
                className={`form-input ${
                  validationErrors.quantity ? "input-error" : ""
                }`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              {validationErrors.quantity && (
                <div className="error-message">{validationErrors.quantity}</div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngày bắt đầu</label>
              <input
                type="date"
                className={`form-input ${
                  validationErrors.startDate ? "input-error" : ""
                }`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {validationErrors.startDate && (
                <div className="error-message">{validationErrors.startDate}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Ngày kết thúc</label>
              <input
                type="date"
                className={`form-input ${
                  validationErrors.endDate ? "input-error" : ""
                }`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {validationErrors.endDate && (
                <div className="error-message">{validationErrors.endDate}</div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="opening">Đang mở</option>
              <option value="closed">Đã đóng</option>
            </select>
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
