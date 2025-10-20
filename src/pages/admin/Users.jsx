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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await getUsers({
        q,
        role: filterRole,
        status: filterStatus,
        page: currentPage - 1,
        size: pageSize,
      });

      setItems(res.content || []);
      setTotal(
        res.totalElements || res.total || res.content?.length || 0 // ✅ thêm fallback đúng
      );
    console.log(res)
    } catch (e) {
      setErr(e?.response?.data?.message || "Không tải được danh sách.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [q, filterRole, filterStatus, currentPage]); // 🔧 thêm currentPage


  // Reset về trang 1 khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
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

  // Pagination calc (🔧 chỉnh lại)
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (currentPage - 1) * pageSize;


  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    const add = (n) => pages.push(n);
    add(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) add(i);
    if (right < totalPages - 1) pages.push("...");
    add(totalPages);
    return pages;
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
              <Th style={{ width: 60 }}>STT</Th>
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
                <td colSpan={6} className="admin-loading">
                  Đang tải…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && ( // 🔧 đổi pageItems → items
              <tr>
                <td colSpan={6} className="admin-empty">
                  Không có dữ liệu.
                </td>
              </tr>
            )}
            {!loading &&
              items.map((u, index) => ( // 🔧 đổi pageItems → items
                <tr key={u.id} className="admin-tr">
                  <Td>{startIndex + index + 1}</Td>
                  <Td>{u.fullName}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <select
                      value={u.role}
                      disabled={savingId === u.id}
                      onChange={(e) =>
                        onUpdateUser(u.id, "role", e.target.value)
                      }
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

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {items.length === 0 ? 0 : startIndex + 1}–
            {startIndex + items.length} trên {total} {/* 🔧 đổi totalItems → total */}
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹ Trước
            </button>

            {getPageNumbers().map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="page-dots">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  className={`btn btn-sm page-btn ${
                    p === currentPage ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              )
            )}

            <button
              className="btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau ›
            </button>
          </div>
        </div>
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

// ========= Modal tạo user =========
function CreateUserModal({ onClose, onCreate }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("INTERN");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const validateFullName = (value) =>
    !value.trim() ? "Họ tên không được để trống" : "";
  const validateEmail = (value) => {
    if (!value.trim()) return "Email không được để trống";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Email không đúng định dạng";
  };
  const validatePassword = (value) => {
    if (!value) return "Mật khẩu không được để trống";
    return value.length < 6 ? "Mật khẩu phải có tối thiểu 6 ký tự" : "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullNameError = validateFullName(fullName);
    let emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (fullNameError || emailError || passwordError) {
      setErrors({ fullName: fullNameError, email: emailError, password: passwordError });
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setSubmitting(true);
    try {
      // Check if email exists
      const { total } = await getUsers({ q: email.trim() });
      if (total > 0) {
        emailError = "Email này đã được sử dụng.";
      }
    } catch (error) {
      // Ignore email check error, let backend handle it
      console.error("Email check failed:", error);
    }

    if (emailError) {
      setErrors({ fullName: fullNameError, email: emailError, password: passwordError });
      toast.error("Vui lòng kiểm tra lại thông tin");
      setSubmitting(false);
      return;
    }

    try {
      await onCreate({ fullName, email, role, password });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thêm người dùng mới</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Họ tên</label>
            <input
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((p) => ({
                  ...p,
                  fullName: validateFullName(e.target.value),
                }));
              }}
              className="form-input"
            />
            {errors.fullName && (
              <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
                {errors.fullName}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({
                  ...p,
                  email: validateEmail(e.target.value),
                }));
              }}
              className="form-input"
            />
            {errors.email && (
              <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({
                  ...p,
                  password: validatePassword(e.target.value),
                }));
              }}
              className="form-input"
            />
            {errors.password && (
              <div style={{ color: "red", fontSize: 14, marginTop: 4 }}>
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
            <label className="form-label">Vai trò</label>
            <select
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
            <button type="button" onClick={onClose} className="btn-outline" disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Tạo"}
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
