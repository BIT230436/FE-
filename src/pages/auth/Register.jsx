import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";
import { register } from "../../services/authService";
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
  const [loading, setLoading] = useState(false);

  // State lưu lỗi cho từng field
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validate fullName
  const validateFullName = (value) => {
    if (!value.trim()) {
      return "Vui lòng nhập họ và tên";
    }
    return "";
  };

  // Validate email
  const validateEmail = (value) => {
    const mail = value.trim();
    if (!mail) {
      return "Vui lòng nhập email";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(mail)) {
      return "Email không hợp lệ";
    }
    return "";
  };

  // Validate password
  const validatePassword = (value) => {
    if (!value) {
      return "Vui lòng nhập mật khẩu";
    }
    if (value.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return "";
  };

  // Validate confirmPassword
  const validateConfirmPassword = (value) => {
    if (!value) {
      return "Vui lòng xác nhận mật khẩu";
    }
    if (password !== value) {
      return "Mật khẩu xác nhận không khớp";
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
    // Nếu đã có confirmPassword, cần validate lại confirmPassword
    if (confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          value !== confirmPassword ? "Mật khẩu xác nhận không khớp" : "",
      }));
    }
  };

  // Handle thay đổi confirmPassword
  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validateConfirmPassword(value),
    }));
  };

  async function onRegister(e) {
    e.preventDefault();
    setLoading(true);

    // Validate tất cả fields
    const fullNameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    // Cập nhật errors
    setErrors({
      fullName: fullNameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // Nếu có lỗi, hiển thị toast và không submit
    if (fullNameError || emailError || passwordError || confirmPasswordError) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      setLoading(false);
      return;
    }

    try {
      // Gọi API register từ authService
      const response = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "USER",
      });

      if (!response.success) {
        toast.error(response.message || "Đăng ký thất bại");
        setLoading(false);
        return;
      }

      // Backend trả về user sau khi đăng ký
      const token = response.token || "session";
      setAuth(response.user, token);

      // Hiển thị thông báo thành công
      toast.success("Đăng ký thành công!");

      // Chuyển về trang login hoặc upload-documents
      if (response.user.role === "USER") {
        navigate("/upload-documents");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
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

        <form onSubmit={onRegister}>
          <input
            value={fullName}
            onChange={handleFullNameChange}
            placeholder="Họ và tên"
            className="auth-input"
            disabled={loading}
          />
          {errors.fullName && (
            <div className="auth-inline-error">{errors.fullName}</div>
          )}

          <input
            value={email}
            onChange={handleEmailChange}
            placeholder="Email"
            className="auth-input"
            type="email"
            disabled={loading}
          />
          {errors.email && (
            <div className="auth-inline-error">{errors.email}</div>
          )}

          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Mật khẩu"
            className="auth-input"
            disabled={loading}
          />
          {errors.password && (
            <div className="auth-inline-error">{errors.password}</div>
          )}

          <input
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Xác nhận mật khẩu"
            className="auth-input"
            disabled={loading}
          />
          {errors.confirmPassword && (
            <div className="auth-inline-error">{errors.confirmPassword}</div>
          )}

          <button
            type="submit"
            disabled={
              loading || !fullName || !email || !password || !confirmPassword
            }
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
