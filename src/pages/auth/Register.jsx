import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { register } from "../../services/authService"; // Import từ authService
import "./auth.css";

import teamworkImage from "../../assets/Hinh-anh-ky-nang-lam-viec-nhom.jpg";
import logoTeam from "../../assets/logoTeam.jpg";

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate(values) {
    const errs = {};
    const name = values.fullName.trim();
    const mail = values.email.trim();
    const pass = values.password;
    const cpass = values.confirmPassword;

    if (!name) errs.fullName = "Vui lòng nhập họ và tên";
    if (!mail) {
      errs.email = "Vui lòng nhập email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(mail)) errs.email = "Email không hợp lệ";
    }
    if (!pass) {
      errs.password = "Vui lòng nhập mật khẩu";
    } else if (pass.length < 6) {
      errs.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!cpass) {
      errs.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (pass !== cpass) {
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    return errs;
  }

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    const values = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      confirmPassword,
    };

    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Vui lòng kiểm tra lại thông tin");
      setLoading(false);
      return;
    }

    try {
      // Gọi API register từ authService
      const response = await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: "USER", // Người đăng ký mặc định là USER
      });

      if (!response.success) {
        setError(response.message || "Đăng ký thất bại");
        setLoading(false);
        return;
      }

      // Backend trả về user sau khi đăng ký
      const token = response.token || "session";
      setAuth(response.user, token);

      // Hiển thị thông báo thành công
      alert("Đăng ký thành công!");

      // Chuyển về trang login hoặc upload-documents
      if (response.user.role === "USER") {
        navigate("/upload-documents");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError(
        err.response?.data?.message || 
        "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={teamworkImage} alt="Teamwork" />
      </div>

      <div className="auth-right">
        <div className="auth-logo">
          <img src={logoTeam} alt="Logo Register" />
        </div>

        <h1 className="auth-title">Đăng ký</h1>

        {error && <div className="auth-alert">{error}</div>}

        <form onSubmit={onRegister}>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Họ và tên"
            className="auth-input"
            disabled={loading}
          />
          {fieldErrors.fullName && (
            <div className="auth-inline-error">{fieldErrors.fullName}</div>
          )}
          
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="auth-input"
            type="email"
            disabled={loading}
          />
          {fieldErrors.email && (
            <div className="auth-inline-error">{fieldErrors.email}</div>
          )}
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            className="auth-input"
            disabled={loading}
          />
          {fieldErrors.password && (
            <div className="auth-inline-error">{fieldErrors.password}</div>
          )}
          
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Xác nhận mật khẩu"
            className="auth-input"
            disabled={loading}
          />
          {fieldErrors.confirmPassword && (
            <div className="auth-inline-error">{fieldErrors.confirmPassword}</div>
          )}

          <button
            type="submit"
            disabled={loading || !fullName || !email || !password || !confirmPassword}
            className="btn btn-success"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="auth-footer">
          Đã có tài khoản?{" "}
          <span className="link-button" onClick={() => navigate("/login")}>
            Đăng nhập
          </span>
        </div>
      </div>
    </div>
  );
}