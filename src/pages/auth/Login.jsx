import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { login } from "../../services/authService"; // API login
import "./auth.css";

import teamworkImage from "../../assets/Hinh-anh-ky-nang-lam-viec-nhom.jpg";
import logoTeam from "../../assets/logoTeam.jpg";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore.persist?.hasHydrated?.();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await login({ email, password });
      if (!response.success) {
        setError(response.message || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }
      setAuth(response.user, response.token);
      if (response.user.role === "USER") {
        navigate("/upload-documents");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
      );
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogle() {
    window.location.href = "http://localhost:8090/oauth2/authorization/google";
  }

  if (!hasHydrated) {
    return (
      <div
        className="auth-container"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div className="auth-right">Đang tải...</div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={teamworkImage} alt="Teamwork" />
      </div>

      <div className="auth-right">
        <div className="auth-logo">
          <img src={logoTeam} alt="Logo Login" />
        </div>

        <h1 className="auth-title">Đăng nhập</h1>

        {error && <div className="auth-alert">{error}</div>}

        <form onSubmit={onLogin}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
            className="auth-input"
            type="email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu"
            disabled={loading}
            className="auth-input"
            required
          />

          <div className="auth-link-row">
            <a href="/forgot-password" className="auth-link">
              Quên mật khẩu?
            </a>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <button
          onClick={loginWithGoogle}
          className="btn btn-outline google-btn"
          disabled={loading}
        >
          <svg
            className="google-icon"
            width="18"
            height="18"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="google-g-clip">
                <circle cx="24" cy="24" r="20" />
              </clipPath>
            </defs>
            <g clipPath="url(#google-g-clip)">
              <path
                fill="#4285F4"
                d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.6l6.1-6.1C34.5 5.1 29.5 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.2-.1-2.5z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l6.6 4.8C14.3 16.1 18.7 13 24 13c2.7 0 5.2.9 7.2 2.6l6.1-6.1C34.5 5.1 29.5 3 24 3c-7.2 0-13.4 3.1-17.7 8.1z"
              />
              <path
                fill="#FBBC05"
                d="M24 43c5.3 0 10.3-1.8 14.1-4.9l-6.5-5.3c-2 1.4-4.5 2.2-7.6 2.2-5.6 0-10.3-3.7-12-8.7l-6.6 5.1C7.9 39.2 15.3 43 24 43z"
              />
              <path
                fill="#EA4335"
                d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.5 5.4-6.5 6.7l6.5 5.3c-2.9 2.1-6.6 3.4-10.8 3.4-8.7 0-16.1-3.8-19.7-9.7l6.6-5.1c1.7 5 6.4 8.7 12 8.7 3.1 0 5.6-.8 7.6-2.2l6.5 5.3C34.3 41.2 29.3 43 24 43z"
              />
            </g>
          </svg>
          <span>Đăng nhập với Google</span>
        </button>

        <div className="auth-footer">
          Chưa có tài khoản?{" "}
          <span className="link-button" onClick={() => navigate("/register")}>
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
}
