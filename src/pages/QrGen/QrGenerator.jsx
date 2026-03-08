import React, { useState, useEffect, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { generateQrCode } from "../../services/attendanceService";

const REFRESH_SECONDS = 300; // 5 phút

function newSessionCode() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ATT-${today}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function QrGenerator() {
  const [qrData, setQrData] = useState(null);
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(REFRESH_SECONDS);

  const generate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const code = newSessionCode();
      const data = await generateQrCode(code);
      setQrData(data);
      setSessionCode(code);
      setCountdown(REFRESH_SECONDS);
    } catch (err) {
      setError(err.message || "Không thể tạo mã QR. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-generate on mount
  useEffect(() => {
    generate();
  }, [generate]);

  // Countdown timer + auto-refresh
  useEffect(() => {
    if (!qrData) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          generate();
          return REFRESH_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qrData, generate]);

  const minutes = String(Math.floor(countdown / 60)).padStart(2, "0");
  const seconds = String(countdown % 60).padStart(2, "0");
  const progress = (countdown / REFRESH_SECONDS) * 100;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>📱 Tạo mã QR chấm công</h2>
        <p style={styles.subtitle}>
          Thực tập sinh quét mã này để chấm công. Mã tự động làm mới sau 5 phút.
        </p>

        {loading && (
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <span>Đang tạo mã QR...</span>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {qrData && !loading && (
          <>
            <div style={styles.qrBox}>
              <QRCodeCanvas value={qrData} size={250} level="H" includeMargin />
            </div>

            <div style={styles.codeBox}>
              <span style={styles.codeLabel}>Mã phiên:</span>
              <code style={styles.code}>{sessionCode}</code>
            </div>

            {/* Countdown bar */}
            <div style={styles.countdownSection}>
              <div style={styles.countdownRow}>
                <span style={styles.countdownText}>Làm mới sau:</span>
                <span style={{ ...styles.countdownTime, color: countdown < 30 ? "#e74c3c" : "#2c3e50" }}>
                  {minutes}:{seconds}
                </span>
              </div>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressBar, width: `${progress}%`, backgroundColor: countdown < 30 ? "#e74c3c" : "#3498db" }} />
              </div>
            </div>
          </>
        )}

        <button
          onClick={generate}
          disabled={loading}
          style={loading ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
        >
          {loading ? "Đang tạo..." : "🔄 Tạo mã mới"}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "32px 16px",
    minHeight: "100%",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "40px",
    maxWidth: "440px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
    textAlign: "center",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    margin: 0,
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    color: "#555",
    padding: "24px 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffb3b3",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#c0392b",
    fontSize: "14px",
    width: "100%",
    textAlign: "center",
  },
  qrBox: {
    padding: "16px",
    border: "2px solid #e8e8f0",
    borderRadius: "12px",
    display: "inline-flex",
    background: "#fafafa",
  },
  codeBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    width: "100%",
  },
  codeLabel: {
    fontSize: "12px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  code: {
    fontSize: "13px",
    color: "#333",
    background: "#f0f2f5",
    padding: "4px 10px",
    borderRadius: "6px",
    fontFamily: "monospace",
  },
  countdownSection: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  countdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countdownText: {
    fontSize: "13px",
    color: "#666",
  },
  countdownTime: {
    fontSize: "20px",
    fontWeight: "700",
    fontFamily: "monospace",
  },
  progressTrack: {
    height: "6px",
    background: "#e8e8f0",
    borderRadius: "99px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "99px",
    transition: "width 1s linear, background-color 0.3s",
  },
  btn: {
    marginTop: "4px",
    padding: "12px 32px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  btnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};
