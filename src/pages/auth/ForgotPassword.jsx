import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../../services/authService";
import "./auth.css";

import logoTeam from "../../assets/logoTeam.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim().toLowerCase());
      if (res.success) {
        setSent(true);
        toast.success(res.message);
      } else {
        toast.error(res.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        className="auth-container"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div className="auth-right" style={{ textAlign: "center" }}>
          <div className="auth-logo">
            <img src={logoTeam} alt="Logo" />
          </div>
          <h2 className="auth-title" style={{ fontSize: "22px" }}>
            📧 Kiểm tra email của bạn
          </h2>
          <p style={{ color: "#555", marginBottom: 8 }}>
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
          </p>
          <p style={{ fontWeight: 600, color: "#333", marginBottom: 24 }}>
            {email}
          </p>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
            Không thấy email? Kiểm tra thư mục Spam hoặc thử lại.
          </p>
          <button
            className="btn btn-outline"
            style={{ marginBottom: 8 }}
            onClick={() => setSent(false)}
          >
            Thử lại
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/login")}
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
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

        <h1 className="auth-title">Quên mật khẩu</h1>
        <p style={{ color: "#666", marginBottom: 20, fontSize: 14 }}>
          Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoFocus
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
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
