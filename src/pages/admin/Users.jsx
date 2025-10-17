import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../services/adminService";
import "./admin.css";

const ROLES = ["ADMIN", "HR", "MENTOR", "INTERN", "USER"];
const STATUSES = ["ACTIVE", "PENDING", "INACTIVE"];

export default function Users() {
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { content, total } = await getUsers({
        q,
        role: filterRole,
        status: filterStatus,
      });
      setItems(content || []);
      setTotal(total || 0);
    } catch (e) {
      setErr(e?.response?.data?.message || "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [q, filterRole, filterStatus]);

  async function onUpdateUser(id, field, value) {
    setSavingId(id);
    try {
      const user = items.find((u) => u.id === id);
      await updateUser({ ...user, [field]: value });
      setItems((prev) =>
        prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSavingId(null);
    }
  }

  async function onCreate(data) {
    try {
      await createUser(data);
      toast.success("Tạo thành công.");
      setShowCreate(false);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Tạo tài khoản thất bại");
    }
  }

  async function onDelete(id) {
    if (!confirm("Xác nhận xóa người dùng này?")) return;
    try {
      await deleteUser(id);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xóa thất bại");
    }
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">Quản lý người dùng</h1>

      <div className="admin-toolbar">
        <input
          placeholder="Tìm họ tên/email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="admin-input admin-input--wide"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="admin-select"
        >
          <option value="">Tất cả vai trò</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="admin-select"
        >
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowCreate(true)}
          className="admin-btn admin-btn--primary"
        >
          Thêm người dùng
        </button>
        <div className="admin-total">Tổng: {total}</div>
      </div>

      {err && <div className="admin-alert">{err}</div>}

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr className="admin-thead-row">
              <Th>Họ tên</Th>
              <Th>Email</Th>
              <Th>Vai trò</Th>
              <Th>Trạng thái</Th>
              <Th style={{ width: 120 }}>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="admin-loading">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">
                  Không có dữ liệu.
                </td>
              </tr>
            )}
            {items.map((u) => (
              <tr key={u.id} className="admin-tr">
                <Td>{u.fullName}</Td>
                <Td>{u.email}</Td>
                <Td>
                  <select
                    value={u.role}
                    disabled={savingId === u.id}
                    onChange={(e) => onUpdateUser(u.id, "role", e.target.value)}
                    className="admin-select admin-select--sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <select
                    value={u.status}
                    disabled={savingId === u.id}
                    onChange={(e) =>
                      onUpdateUser(u.id, "status", e.target.value)
                    }
                    className="admin-select admin-select--sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Td>
                <Td>
                  <button
                    onClick={() => onDelete(u.id)}
                    className="btn-inline btn-inline--danger"
                  >
                    Xoá
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreate={onCreate}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose, onCreate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("INTERN");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // State lưu lỗi cho từng field
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // Validate fullName
  const validateFullName = (value) => {
    if (!value.trim()) {
      return "Họ tên không được để trống";
    }
    return "";
  };

  // Validate email
  const validateEmail = (value) => {
    if (!value.trim()) {
      return "Email không được để trống";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Email không đúng định dạng";
    }
    return "";
  };

  // Validate password
  const validatePassword = (value) => {
    if (!value) {
      return "Mật khẩu không được để trống";
    }
    if (value.length < 6) {
      return "Mật khẩu phải có tối thiểu 6 ký tự";
    }
    return "";
  };

  // Handle thay đổi fullName
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    setErrors((prev) => ({ ...prev, fullName: validateFullName(value) }));
  };

  // Handle thay đổi email
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  // Handle thay đổi password
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate tất cả fields
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    // Cập nhật errors
    setErrors({
      fullName: fullNameError,
      email: emailError,
      password: passwordError,
    });

    // Nếu có lỗi, hiển thị toast và không submit
    if (fullNameError || emailError || passwordError) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    // Nếu không có lỗi, gọi onCreate
    onCreate({ fullName, email, role, password });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thêm người dùng mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              Họ tên
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={handleFullNameChange}
              className="form-input"
            />
            {errors.fullName && (
              <div style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
                {errors.fullName}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="form-input"
            />
            {errors.email && (
              <div style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>

            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className="form-input"
            />
            {errors.password && (
              <div style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
                {errors.password}
              </div>
            )}

            <div className="form-row">
              <div className="form-hint">Tối thiểu 6 ký tự.</div>

              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="btn-inline"
              >
                {showPw ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Vai trò
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-outline">
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

const Th = ({ children, style }) => (
  <th className="admin-th" style={style}>
    {children}
  </th>
);
const Td = ({ children }) => <td className="admin-td">{children}</td>;
