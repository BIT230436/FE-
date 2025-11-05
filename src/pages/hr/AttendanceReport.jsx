import React, { useState, useEffect } from "react";
import {
  DatePicker,
  Table,
  Button,
  Select,
  Input,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Spin,
} from "antd";
import moment from "moment";
import {
  SearchOutlined,
  FileExcelOutlined,
  FilterOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import "./AttendanceReport.css";
import * as AttendanceService from "../../services/attendanceService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AttendanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: [moment().startOf("month"), moment().endOf("month")],
    group: null,
    mentor: null,
    searchText: "",
  });

  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Dữ liệu phòng ban (lấy từ dữ liệu mẫu)
  const [departments, setDepartments] = useState([
    "Phát triển phần mềm",
    "Thiết kế",
    "Nhân sự",
    "Kế toán",
    "Kinh doanh",
    "Marketing",
  ]);

  // Dữ liệu mentor (tạo từ dữ liệu mẫu)
  const [mentors] = useState([
    { id: 1, name: "Nguyễn Văn A", department: "Phát triển phần mềm" },
    { id: 2, name: "Trần Thị B", department: "Thiết kế" },
    { id: 3, name: "Lê Văn C", department: "Phát triển phần mềm" },
    { id: 4, name: "Phạm Thị D", department: "Nhân sự" },
    { id: 5, name: "Hoàng Văn E", department: "Kế toán" },
  ]);

  // Tạo thêm dữ liệu mẫu
  const generateMockData = () => {
    const names = [
      "Nguyễn Văn An",
      "Trần Thị Bình",
      "Lê Văn Cường",
      "Phạm Thị Dung",
      "Hoàng Văn Đạt",
      "Vũ Thị Hà",
      "Đặng Văn Hùng",
      "Bùi Thị Hương",
      "Đỗ Văn Khánh",
      "Nguyễn Thị Lan",
      "Trần Văn Minh",
      "Lê Thị Ngọc",
    ];

    const statuses = ["Tốt", "Khá", "Trung bình", "Yếu"];

    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      employeeId: `NV${String(i + 100).padStart(3, "0")}`,
      fullName: names[Math.floor(Math.random() * names.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      workingDays: Math.floor(Math.random() * 22) + 1, // 1-22 ngày
      leaveDays: Math.floor(Math.random() * 5), // 0-4 ngày
      lateDays: Math.floor(Math.random() * 4), // 0-3 lần
      absentDays: Math.floor(Math.random() * 3), // 0-2 ngày
      status: statuses[Math.floor(Math.random() * statuses.length)],
    }));
  };
  const [summary, setSummary] = useState({
    totalWorkingDays: 0,
    totalLeaveDays: 0,
    totalLateDays: 0,
    totalAbsentDays: 0,
  });

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchAttendanceData();
  }, [filters.dateRange, filters.group, filters.mentor, filters.searchText]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const data = await AttendanceService.getAttendanceReport(filters);

      // Đảm bảo data là mảng trước khi setState
      const attendanceData = Array.isArray(data) ? data : [];
      setDataSource(attendanceData);

      // Tính tổng hợp dữ liệu
      const summaryData = attendanceData.reduce(
        (acc, curr) => ({
          totalWorkingDays:
            acc.totalWorkingDays + (parseInt(curr.workingDays) || 0),
          totalLeaveDays: acc.totalLeaveDays + (parseInt(curr.leaveDays) || 0),
          totalLateDays: acc.totalLateDays + (parseInt(curr.lateDays) || 0),
          totalAbsentDays:
            acc.totalAbsentDays + (parseInt(curr.absentDays) || 0),
        }),
        {
          totalWorkingDays: 0,
          totalLeaveDays: 0,
          totalLateDays: 0,
          totalAbsentDays: 0,
        }
      );

      setSummary(summaryData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu chuyên cần:", error);
      // Hiển thị dữ liệu mẫu khi có lỗi
      const sampleData = [
        {
          id: 1,
          employeeId: "NV001",
          fullName: "Nguyễn Văn A",
          department: "Phát triển phần mềm",
          workingDays: 20,
          leaveDays: 2,
          lateDays: 1,
          absentDays: 0,
          status: "Tốt",
        },
        {
          id: 2,
          employeeId: "NV002",
          fullName: "Trần Thị B",
          department: "Thiết kế",
          workingDays: 18,
          leaveDays: 1,
          lateDays: 0,
          absentDays: 1,
          status: "Khá",
        },
      ];
      setDataSource(sampleData);

      const sampleSummary = sampleData.reduce(
        (acc, curr) => ({
          totalWorkingDays:
            acc.totalWorkingDays + (parseInt(curr.workingDays) || 0),
          totalLeaveDays: acc.totalLeaveDays + (parseInt(curr.leaveDays) || 0),
          totalLateDays: acc.totalLateDays + (parseInt(curr.lateDays) || 0),
          totalAbsentDays:
            acc.totalAbsentDays + (parseInt(curr.absentDays) || 0),
        }),
        {
          totalWorkingDays: 0,
          totalLeaveDays: 0,
          totalLateDays: 0,
          totalAbsentDays: 0,
        }
      );
      setSummary(sampleSummary);

      message.warning(
        "Đang sử dụng dữ liệu mẫu. Vui lòng kiểm tra kết nối API."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã TTS",
      dataIndex: "employeeId",
      key: "employeeId",
      fixed: "left",
      width: 100,
    },
    {
      title: "Tên thực tập sinh",
      dataIndex: "fullName",
      key: "fullName",
      fixed: "left",
      width: 150,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      filters: [
        { text: "Phát triển phần mềm", value: "Phát triển phần mềm" },
        { text: "Thiết kế", value: "Thiết kế" },
      ],
      onFilter: (value, record) => record.department.includes(value),
    },
    {
      title: "Số ngày đi làm",
      dataIndex: "workingDays",
      key: "workingDays",
      sorter: (a, b) => (a.workingDays || 0) - (b.workingDays || 0),
      render: (days) => <span className="working-days">{days || 0} ngày</span>,
    },
    {
      title: "Nghỉ phép",
      dataIndex: "leaveDays",
      key: "leaveDays",
      sorter: (a, b) => (a.leaveDays || 0) - (b.leaveDays || 0),
      render: (days) => <span className="leave-days">{days || 0} ngày</span>,
    },
    {
      title: "Đi muộn",
      dataIndex: "lateDays",
      key: "lateDays",
      sorter: (a, b) => (a.lateDays || 0) - (b.lateDays || 0),
      render: (days) => (
        <span className={days > 0 ? "late-days" : ""}>
          {days > 0 ? `${days} ngày` : "Không"}
        </span>
      ),
    },
    {
      title: "Vắng mặt",
      dataIndex: "absentDays",
      key: "absentDays",
      sorter: (a, b) => (a.absentDays || 0) - (b.absentDays || 0),
      render: (days) => (
        <span className={days > 0 ? "absent-days" : ""}>
          {days > 0 ? `${days} ngày` : "Không"}
        </span>
      ),
    },
  ];

  const handleSearch = (e) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  const handleDepartmentChange = (value) => {
    setFilters((prev) => ({ ...prev, group: value }));
  };

  const handleMentorChange = (value) => {
    setFilters((prev) => ({ ...prev, mentor: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: [moment().startOf("month"), moment().endOf("month")],
      group: null,
      mentor: null,
      searchText: "",
    });
  };

  const handleSearchSubmit = () => {
    fetchAttendanceData();
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await AttendanceService.exportToExcel(filters);
      message.success("Xuất file Excel thành công");
    } catch (error) {
      message.error("Có lỗi khi xuất file Excel");
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo dữ liệu mẫu khi component mount
  useEffect(() => {
    // Thêm dữ liệu mẫu vào localStorage nếu chưa có
    const mockData = generateMockData();
    if (!localStorage.getItem("mockAttendanceData")) {
      localStorage.setItem("mockAttendanceData", JSON.stringify(mockData));
    }
  }, []);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <div className="attendance-report">
      <Spin
        spinning={loading}
        indicator={antIcon}
        tip="Đang tải dữ liệu..."
        size="large"
      >
        <h2>Báo cáo chuyên cần thực tập sinh</h2>

        <Card className="filter-card">
          {/* Main Filters Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <div className="filter-item">
                <label className="filter-item label">Từ ngày</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                />
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="filter-item">
                <label className="filter-item label">Đến ngày</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          {/* Filters Row (department + mentor) */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <div className="filter-item">
                <label>Phòng ban:</label>
                <Select
                  style={{ width: "100%", height: "40px" }}
                  placeholder="Tất cả phòng ban"
                  value={filters.group}
                  onChange={handleDepartmentChange}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {departments.map((dept, index) => (
                    <Option key={index} value={dept}>
                      {dept}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="filter-item">
                <label>Mentor:</label>
                <Select
                  style={{ width: "100%", height: "40px" }}
                  placeholder="Tất cả mentor"
                  value={filters.mentor}
                  onChange={handleMentorChange}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {mentors.map((mentor) => (
                    <Option key={mentor.id} value={mentor.id}>
                      {mentor.name} ({mentor.department})
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          </Row>

          {/* Search and Action Buttons Row */}
          <Row className="search-row" gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <div
                className="filter-item"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div style={{ minWidth: "60px" }}>Tìm kiếm:</div>
                <Input
                  placeholder="Tìm kiếm theo tên hoặc mã TTS"
                  prefix={<SearchOutlined />}
                  value={filters.searchText}
                  onChange={handleSearch}
                  onPressEnter={handleSearchSubmit}
                  allowClear
                  style={{ flex: 1 }}
                />
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                className="filter-item"
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <Button
                  onClick={handleResetFilters}
                  disabled={loading}
                  type="primary"
                  style={{
                    backgroundColor: "#1890ff",
                    borderColor: "#1890ff",
                    color: "#fff",
                    flex: 1,
                    maxWidth: "120px",
                  }}
                >
                  Đặt lại
                </Button>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExport}
                  loading={loading}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    flex: 1,
                    maxWidth: "150px",
                  }}
                >
                  Xuất Excel
                </Button>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Summary Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số TTS"
                value={dataSource.length}
                valueStyle={{ color: "#1890ff" }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng ngày đi muộn"
                value={summary.totalLateDays}
                valueStyle={{ color: "#faad14" }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng ngày nghỉ phép"
                value={summary.totalLeaveDays}
                valueStyle={{ color: "#52c41a" }}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng ngày vắng mặt"
                value={summary.totalAbsentDays}
                valueStyle={{ color: "#f5222d" }}
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <div className="report-table">
          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Tổng cộng: ${total} TTS`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            scroll={{ x: "max-content" }}
            className="attendance-table"
            bordered
            size="middle"
            loading={loading}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ fontWeight: "bold" }}>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    Tổng cộng
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    {summary.totalWorkingDays} ngày
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    {summary.totalLeaveDays} ngày
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3}>
                    {summary.totalLateDays} ngày
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    {summary.totalAbsentDays} ngày
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </Spin>
    </div>
  );
};

export default AttendanceReport;
