import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  getInternCompletionStats,
  getProgramCompletionStats,
  getPrograms,
  getMentors,
  getMajors,
  getProgressOverTime,
} from "../../services/statisticsService";
import "./statistics.css";

export default function Statistics() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // States cho dữ liệu thống kê
  const [completionStats, setCompletionStats] = useState(null);
  const [programStats, setProgramStats] = useState([]);
  const [timelineStats, setTimelineStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // States cho filters
  const [programs, setPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [majors, setMajors] = useState([]);
  const [filters, setFilters] = useState({
    programId: "",
    mentorId: "",
    major: "",
  });

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (user?.role !== "HR" && user?.role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Load dữ liệu filter options
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [programsData, mentorsData, majorsData] = await Promise.all([
          getPrograms(),
          getMentors(),
          getMajors(),
        ]);
        setPrograms(programsData);
        setMentors(mentorsData);
        setMajors(majorsData);
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    }
    loadFilterOptions();
  }, []);

  // Load dữ liệu thống kê
  useEffect(() => {
    async function loadStatistics() {
      setLoading(true);
      try {
        const [completion, programs, timeline] = await Promise.all([
          getInternCompletionStats(),
          getProgramCompletionStats(filters),
          getProgressOverTime(filters),
        ]);

        setCompletionStats(completion);
        setProgramStats(programs);
        setTimelineStats(timeline);
      } catch (error) {
        console.error("Error loading statistics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStatistics();
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      programId: "",
      mentorId: "",
      major: "",
    });
  };

  // Dữ liệu cho Pie Chart (Hoàn thành vs Chưa hoàn thành)
  const pieData = completionStats
    ? [
        {
          name: "Hoàn thành",
          value: completionStats.completed,
          color: "#00C49F",
        },
        {
          name: "Chưa hoàn thành",
          value: completionStats.notCompleted,
          color: "#FF8042",
        },
      ]
    : [];

  // Tính phần trăm hoàn thành
  const completionRate = completionStats?.completionRate || 0;

  if (loading) {
    return (
      <div className="statistics-container">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>⏳ Đang tải dữ liệu thống kê...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      {/* Header */}
      <div className="statistics-header">
        <h1>📊 Thống kê chương trình thực tập</h1>
        <button className="btn-back" onClick={() => navigate("/dashboard")}>
          ← Quay lại Dashboard
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="filters-section">
        <h2>🔍 Bộ lọc</h2>
        <div className="filters-grid">
          <div className="filter-item">
            <label>Chương trình thực tập</label>
            <select
              name="programId"
              value={filters.programId}
              onChange={handleFilterChange}
            >
              <option value="">-- Tất cả --</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Mentor</label>
            <select
              name="mentorId"
              value={filters.mentorId}
              onChange={handleFilterChange}
            >
              <option value="">-- Tất cả --</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Chuyên ngành</label>
            <select
              name="major"
              value={filters.major}
              onChange={handleFilterChange}
            >
              <option value="">-- Tất cả --</option>
              {majors.map((major) => (
                <option key={major.id} value={major.id}>
                  {major.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <button className="btn-reset" onClick={handleResetFilters}>
              🔄 Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Tổng quan */}
      <div className="overview-section">
        <div className="stat-card card-blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{completionStats?.total || 0}</div>
            <div className="stat-label">Tổng số TTS</div>
          </div>
        </div>

        <div className="stat-card card-green">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{completionStats?.completed || 0}</div>
            <div className="stat-label">TTS hoàn thành</div>
          </div>
        </div>

        <div className="stat-card card-orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">
              {completionStats?.notCompleted || 0}
            </div>
            <div className="stat-label">TTS chưa hoàn thành</div>
          </div>
        </div>

        <div className="stat-card card-purple">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Tỷ lệ hoàn thành</div>
          </div>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="charts-section">
        {/* Pie Chart - Tỷ lệ hoàn thành */}
        <div className="chart-container">
          <h2>🥧 Tỷ lệ hoàn thành chương trình</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Tiến độ theo chương trình */}
        <div className="chart-container">
          <h2>📊 Tiến độ theo chương trình</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="programName"
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#00C49F" name="Hoàn thành" />
              <Bar dataKey="inProgress" fill="#FFBB28" name="Đang thực hiện" />
              <Bar dataKey="notStarted" fill="#FF8042" name="Chưa bắt đầu" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart - Xu hướng theo thời gian */}
        <div className="chart-container chart-full-width">
          <h2>📈 Xu hướng hoàn thành theo thời gian</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#8884d8"
                name="Tỷ lệ hoàn thành (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bảng chi tiết */}
      <div className="details-section">
        <h2>📋 Chi tiết theo chương trình</h2>
        {programStats.length > 0 ? (
          <div className="table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Chương trình</th>
                  <th>Tổng số TTS</th>
                  <th>Hoàn thành</th>
                  <th>Đang thực hiện</th>
                  <th>Chưa bắt đầu</th>
                  <th>Tỷ lệ (%)</th>
                </tr>
              </thead>
              <tbody>
                {programStats.map((program, index) => (
                  <tr key={index}>
                    <td>{program.programName}</td>
                    <td>{program.total}</td>
                    <td className="text-success">{program.completed}</td>
                    <td className="text-warning">{program.inProgress}</td>
                    <td className="text-danger">{program.notStarted}</td>
                    <td>
                      <strong>{program.completionRate}%</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: "center", padding: "20px", color: "#999" }}>
            Không có dữ liệu thống kê
          </p>
        )}
      </div>
    </div>
  );
}
