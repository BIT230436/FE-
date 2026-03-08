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
  getInternsBySchool,
  getInternsByMajor,
  getRecruitmentTimeline,
} from "../../services/statisticsService";
import "./Statistics.css";

export default function Statistics() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Tab state
  const [activeTab, setActiveTab] = useState("completion"); // completion | candidates

  // States cho dữ liệu thống kê hoàn thành
  const [completionStats, setCompletionStats] = useState(null);
  const [programStats, setProgramStats] = useState([]);
  const [timelineStats, setTimelineStats] = useState([]);

  // States cho dữ liệu nguồn ứng viên
  const [schoolStats, setSchoolStats] = useState([]);
  const [majorStats, setMajorStats] = useState([]);
  const [recruitmentTimeline, setRecruitmentTimeline] = useState([]);

  const [loading, setLoading] = useState(true);

  // States cho filters - Tab 1
  const [programs, setPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [majors, setMajors] = useState([]);
  const [filters, setFilters] = useState({
    programId: "",
    mentorId: "",
    major: "",
  });

  // States cho filters - Tab 2
  const [candidateFilters, setCandidateFilters] = useState({
    programId: "",
    startDate: "",
    endDate: "",
  });

  // Kiểm tra quyền truy cập
  useEffect(() => {
    if (user?.role !== "HR" && user?.role !== "ADMIN") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Load filter options
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

  // Load dữ liệu thống kê hoàn thành
  useEffect(() => {
    if (activeTab !== "completion") return;

    async function loadCompletionStats() {
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
        console.error("Error loading completion statistics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCompletionStats();
  }, [activeTab, filters]);

  // Load dữ liệu nguồn ứng viên
  useEffect(() => {
    if (activeTab !== "candidates") return;

    async function loadCandidateStats() {
      setLoading(true);
      try {
        const [schools, majorsData, timeline] = await Promise.all([
          getInternsBySchool(candidateFilters),
          getInternsByMajor(candidateFilters),
          getRecruitmentTimeline(candidateFilters),
        ]);

        setSchoolStats(schools);
        setMajorStats(majorsData);
        setRecruitmentTimeline(timeline);
      } catch (error) {
        console.error("Error loading candidate statistics:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCandidateStats();
  }, [activeTab, candidateFilters]);

  // Handle filter change - Tab 1
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle filter change - Tab 2
  const handleCandidateFilterChange = (e) => {
    const { name, value } = e.target;
    setCandidateFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const handleResetFilters = () => {
    if (activeTab === "completion") {
      setFilters({ programId: "", mentorId: "", major: "" });
    } else {
      setCandidateFilters({ programId: "", startDate: "", endDate: "" });
    }
  };

  const completionRate = completionStats?.completionRate || 0;

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

  // Colors cho biểu đồ
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
    "#ffc658",
    "#ff7c7c",
    "#8dd1e1",
    "#d084d0",
  ];

  return (
    <div className="statistics-container">
      {/* Header */}
      <div className="statistics-header">
        <h1>📊 Thống kê chương trình thực tập</h1>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === "completion" ? "active" : ""}`}
          onClick={() => setActiveTab("completion")}
        >
          📈 Tỷ lệ hoàn thành
        </button>
        <button
          className={`tab-btn ${activeTab === "candidates" ? "active" : ""}`}
          onClick={() => setActiveTab("candidates")}
        >
          🎓 Nguồn ứng viên
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <h2>⏳ Đang tải dữ liệu thống kê...</h2>
        </div>
      ) : (
        <>
          {/* TAB 1: TỶ LỆ HOÀN THÀNH */}
          {activeTab === "completion" && (
            <>
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
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
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
                      {mentors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName}
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
                      {majors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
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
                    <div className="stat-value">
                      {completionStats?.total || 0}
                    </div>
                    <div className="stat-label">Tổng số TTS</div>
                  </div>
                </div>
                <div className="stat-card card-green">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <div className="stat-value">
                      {completionStats?.completed || 0}
                    </div>
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
                      <Bar
                        dataKey="completed"
                        fill="#00C49F"
                        name="Hoàn thành"
                      />
                      <Bar
                        dataKey="inProgress"
                        fill="#FFBB28"
                        name="Đang thực hiện"
                      />
                      <Bar
                        dataKey="notStarted"
                        fill="#FF8042"
                        name="Chưa bắt đầu"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

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
                            <td className="text-success">
                              {program.completed}
                            </td>
                            <td className="text-warning">
                              {program.inProgress}
                            </td>
                            <td className="text-danger">
                              {program.notStarted}
                            </td>
                            <td>
                              <strong>{program.completionRate}%</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                    }}
                  >
                    Không có dữ liệu
                  </p>
                )}
              </div>
            </>
          )}

          {/* TAB 2: NGUỒN ỨNG VIÊN */}
          {activeTab === "candidates" && (
            <>
              {/* Bộ lọc */}
              <div className="filters-section">
                <h2>🔍 Bộ lọc</h2>
                <div className="filters-grid">
                  <div className="filter-item">
                    <label>Chương trình thực tập</label>
                    <select
                      name="programId"
                      value={candidateFilters.programId}
                      onChange={handleCandidateFilterChange}
                    >
                      <option value="">-- Tất cả --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Từ ngày</label>
                    <input
                      type="date"
                      name="startDate"
                      value={candidateFilters.startDate}
                      onChange={handleCandidateFilterChange}
                    />
                  </div>
                  <div className="filter-item">
                    <label>Đến ngày</label>
                    <input
                      type="date"
                      name="endDate"
                      value={candidateFilters.endDate}
                      onChange={handleCandidateFilterChange}
                    />
                  </div>
                  <div className="filter-item">
                    <button className="btn-reset" onClick={handleResetFilters}>
                      🔄 Đặt lại
                    </button>
                  </div>
                </div>
              </div>

              {/* Biểu đồ nguồn ứng viên */}
              <div className="charts-section">
                <div className="chart-container">
                  <h2>🏫 Số lượng TTS theo trường đại học</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={schoolStats} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="school" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" name="Số lượng TTS">
                        {schoolStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container">
                  <h2>📚 Số lượng TTS theo ngành học</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={majorStats}
                        dataKey="count"
                        nameKey="major"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        label={({ major, count }) => `${major}: ${count}`}
                      >
                        {majorStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-container chart-full-width">
                  <h2>📅 Xu hướng tuyển dụng theo thời gian</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={recruitmentTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#00C49F"
                        name="Số lượng TTS"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bảng chi tiết */}
              <div className="details-section">
                <h2>📋 Top 10 trường đại học</h2>
                {schoolStats.length > 0 ? (
                  <div className="table-container">
                    <table className="stats-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Trường đại học</th>
                          <th>Số lượng TTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schoolStats.map((school, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{school.school}</td>
                            <td>
                              <strong>{school.count}</strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                    }}
                  >
                    Không có dữ liệu
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
