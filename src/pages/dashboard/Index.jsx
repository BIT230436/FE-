import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import "./dashboard.css";
import { getUsers } from "../../services/adminService";
import { getInternships } from "../../services/internshipService";
import { getContractTotal } from "../../services/documentService";
import { getUserRoleStats } from "../../services/adminService";
import { getInternStatusStats } from "../../services/internshipService";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [userCount, setUserCount] = useState(null);
  const [profileCount, setProfileCount] = useState(null);
  const [contractCount, setContractCount] = useState(null);
  const [roleStats, setRoleStats] = useState([]);
  const [internStats, setInternStats] = useState([]);

  useEffect(() => {
    console.log("Dashboard - Current user:", user);
    // Chỉ USER mới bị chuyển hướng, INTERN có thể xem Dashboard
    if (user?.role === "USER") {
      console.log("Redirecting USER to upload-documents");
      navigate("/upload-documents", { replace: true });
    }
  }, [user, navigate]);

  // Tổng số người dùng
  useEffect(() => {
    let mounted = true;
    async function fetchUserCount() {
      try {
        const data = await getUsers({ q: "", role: "", status: "" });
        // Cố gắng lấy totalUsers trước, nếu không có thì lấy total hoặc 0
        if (mounted) setUserCount(data.totalUsers ?? data.total ?? 0);
      } catch (err) {
        console.error("Failed to load user count", err);
        if (mounted) setUserCount(0);
      }
    }
    fetchUserCount();
    return () => {
      mounted = false;
    };
  }, []);
  // Tổng số hồ sơ thực tập sinh
  useEffect(() => {
    let mounted = true;

    async function fetchProfileCount() {
      try {
        // Gọi API /intern-profiles?page=0&size=1 để lấy totalElements
        const data = await getInternships({ page: 0, size: 1 });
        const total = data.pagination?.totalElements ?? 0;
        if (mounted) setProfileCount(total);
      } catch (err) {
        console.error("Failed to load intern profile count", err);
        if (mounted) setProfileCount(0);
      }
    }

    fetchProfileCount();
    return () => {
      mounted = false;
    };
  }, []);

  // Tổng số hợp đồng
  useEffect(() => {
    let mounted = true;
    async function fetchContractCount() {
      try {
        const total = await getContractTotal();
        if (mounted) setContractCount(total);
      } catch (err) {
        console.error("Failed to load contract count", err);
        if (mounted) setContractCount(0);
      }
    }
    fetchContractCount();
    return () => {
      mounted = false;
    };
  }, []);

  // Thống kê số lượng user theo role
  useEffect(() => {
    let mounted = true;

    async function fetchRoleStats() {
      try {
        const data = await getUserRoleStats();
        if (mounted) setRoleStats(data);
      } catch (err) {
        console.error("Failed to load user role stats", err);
      }
    }

    fetchRoleStats();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchInternStats() {
      try {
        const data = await getInternStatusStats();
        if (mounted) setInternStats(data);
      } catch (err) {
        console.error("Failed to load intern status stats", err);
      }
    }

    fetchInternStats();
    return () => {
      mounted = false;
    };
  }, []);

  // Chỉ USER mới không được xem Dashboard
  if (user?.role === "USER") {
    return (
      <div className="dashboard-container center">
        <p>Đang chuyển hướng...</p>
      </div>
    );
  }

  // số liệu, dùng ký tự unicode
  const stats = [
    {
      label: "Hợp đồng",
      value: contractCount ?? "loading...",
      icon: "📑",
      bg: "#eafbe7",
    },
    {
      label: "Thực tập sinh",
      value: profileCount ?? "loading...",
      icon: "📄",
      bg: "#ffeaea",
    },
    {
      label: "Người dùng",
      value: userCount ?? "loading...",
      icon: "👥",
      bg: "#eaf3ff",
    },
  ];

  // Thay thế truy cập nhanh bằng thông báo, mẹo, hoặc lịch sử hoạt động
  const tips = [
    {
      icon: "💡",
      text: "Bạn có thể cập nhật thông tin cá nhân tại trang hồ sơ.",
    },
    { icon: "📅", text: "Kiểm tra lịch thực tập và các sự kiện sắp tới." },
    { icon: "🔔", text: "Luôn theo dõi thông báo mới từ hệ thống." },
    { icon: "🛡️", text: "Bảo mật tài khoản bằng cách đổi mật khẩu định kỳ." },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-desc">
        Chào mừng <strong>{user?.fullName}</strong> ({user?.role})
      </p>
      <div
        style={{
          marginTop: 24,
          marginBottom: 32,
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{
              minWidth: 180,
              flex: "1 1 180px",
              background: stat.bg,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span style={{ fontSize: 32 }}>{stat.icon}</span>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: 15, color: "#555" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12, color: "#2b7cff" }}>
          Mẹo sử dụng hệ thống
        </h2>
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {tips.map((tip, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>{tip.icon}</span>
              <span style={{ fontSize: 15 }}>{tip.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="chart-row">
        {/* Biểu đồ tròn thống kê role */}
        <div className="chart-box">
          <h2 style={{ fontSize: 18, marginBottom: 12, color: "#2b7cff" }}>
            Thống kê người dùng theo vai trò
          </h2>

          <PieChart width={400} height={300}>
            <Pie
              data={roleStats}
              dataKey="count"
              nameKey="role"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {roleStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#f620aeff"][
                      index % 5
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Biểu đồ tròn thực tập sinh */}
        <div className="chart-box">
          <h2 style={{ fontSize: 18, marginBottom: 12, color: "#2b7cff" }}>
            Thống kê trạng thái thực tập sinh
          </h2>

          <PieChart width={400} height={300}>
            <Pie
              data={internStats}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
            >
              {internStats.map((entry, index) => (
                <Cell
                  key={`cell-intern-${index}`}
                  fill={["#00C49F", "#FF8042", "#8884D8"][index % 3]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
        }}
      ></div>

      {user?.role === "ADMIN" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Quản lý hệ thống</h3>
          <p>Bạn có thể quản lý người dùng, phân quyền và xem báo cáo.</p>
        </div>
      )}
      {user?.role === "HR" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Quản lý nhân sự</h3>
          <p>
            Bạn có thể quản lý thực tập sinh, duyệt hồ sơ và theo dõi tiến độ.
          </p>
        </div>
      )}
      {user?.role === "INTERN" && (
        <div style={{ marginTop: "20px" }}>
          <h3>Thực tập sinh</h3>
          <p>
            Chào mừng bạn đến với chương trình thực tập! Bạn có thể xem profile
            và theo dõi tiến độ thực tập của mình.
          </p>
        </div>
      )}
    </div>
  );
}
