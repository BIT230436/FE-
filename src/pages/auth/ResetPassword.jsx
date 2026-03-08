import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/authService";
import "./auth.css";

import logoTeam from "../../assets/logoTeam.jpg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Token không hợp lệ
  if (!token) {
    return (
      <div
        className="auth-container"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div className="auth-right" style={{ textAlign: "center" }}>
          <h2 className="auth-title">Liên kết không hợp lệ</h2>
          <p style={{ color: "#dc3545", marginBottom: 20 }}>
            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/forgot-password")}>
            Yêu cầu liên kết mới
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        toast.success(res.message);
        navigate("/login");
      } else {
        toast.error(res.message || "Đặt lại mật khẩu thất bại.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-container"
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <div className="auth-right">
        <div className="auth-logo">
          <img src={logoTeam} alt="Logo" />
        </div>

        <h1 className="auth-title">Đặt lại mật khẩu</h1>
        <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="auth-input"
            placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoFocus
            minLength={6}
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>

        <div className="auth-footer">
          <span className="link-button" onClick={() => navigate("/login")}>
            ← Quay lại đăng nhập
          </span>
        </div>
      </div>
    </div>
  );
}
