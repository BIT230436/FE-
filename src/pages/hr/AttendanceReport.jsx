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
import dayjs from "dayjs";
import {
  SearchOutlined,
  FileExcelOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./AttendanceReport.css";
import * as AttendanceService from "../../services/attendanceService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const AttendanceReport = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: [dayjs().startOf("month"), dayjs().endOf("month")],
    group: null,
    mentor: null,
    searchText: "",
  });

  const [summary, setSummary] = useState({
    totalInterns: 0,
    totalWorkingDays: 0,
    totalLateDays: 0,
    totalAbsentDays: 0,
  });

  // Danh sách phòng ban (có thể lấy từ API sau)
  const [departments] = useState([
    "Phát triển phần mềm",
    "Thiết kế",
    "Nhân sự",
    "Kế toán",
    "Kinh doanh",
    "Marketing",
  ]);

  // Danh sách mentor (có thể lấy từ API sau)
  const [mentors] = useState([
    { id: 1, name: "Nguyễn Văn A" },
    { id: 2, name: "Trần Thị B" },
    { id: 3, name: "Lê Văn C" },
    { id: 4, name: "Phạm Thị D" },
  ]);

  // Load data khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);

      // Gọi API với filters
      const response = await AttendanceService.getAttendanceReport(filters);

      console.log("API Response:", response);

      // Xử lý response data
      let attendanceData = [];

      if (response && response.data) {
        attendanceData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        attendanceData = response;
      }

      // Transform data nếu cần (tùy theo cấu trúc backend trả về)
      const transformedData = attendanceData.map((record, index) => ({
        key: record.id || index,
        id: record.id,
        employeeId: record.internId || record.employeeId || `TTS${index + 1}`,
        fullName: record.internName || record.fullName || "N/A",
        department: record.department || "Chưa phân công",
        workingDays: record.totalWorkingDays || record.workingDays || 0,
        leaveDays: record.totalLeaveDays || record.leaveDays || 0,
        lateDays: record.totalLateDays || record.lateDays || 0,
        absentDays: record.totalAbsentDays || record.absentDays || 0,
      }));

      setDataSource(transformedData);

      // Tính toán summary
      const summaryData = transformedData.reduce(
        (acc, curr) => ({
          totalInterns: acc.totalInterns + 1,
          totalWorkingDays:
            acc.totalWorkingDays + (parseInt(curr.workingDays) || 0),
          totalLateDays: acc.totalLateDays + (parseInt(curr.lateDays) || 0),
          totalAbsentDays:
            acc.totalAbsentDays + (parseInt(curr.absentDays) || 0),
        }),
        {
          totalInterns: 0,
          totalWorkingDays: 0,
          totalLateDays: 0,
          totalAbsentDays: 0,
        }
      );

      setSummary(summaryData);

      if (transformedData.length === 0) {
        message.info("Không có dữ liệu trong khoảng thời gian này");
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu chuyên cần:", error);
      message.error(error.message || "Không thể tải dữ liệu báo cáo");
      setDataSource([]);
      setSummary({
        totalInterns: 0,
        totalWorkingDays: 0,
        totalLateDays: 0,
        totalAbsentDays: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      fixed: "left",
      render: (_, __, index) => index + 1,
    },
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
      width: 180,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      width: 150,
    },
    {
      title: "Số ngày đi làm",
      dataIndex: "workingDays",
      key: "workingDays",
      width: 120,
      sorter: (a, b) => (a.workingDays || 0) - (b.workingDays || 0),
      render: (days) => (
        <span
          className="working-days"
          style={{ color: "#52c41a", fontWeight: "500" }}
        >
          {days || 0} ngày
        </span>
      ),
    },
    {
      title: "Nghỉ phép",
      dataIndex: "leaveDays",
      key: "leaveDays",
      width: 100,
      sorter: (a, b) => (a.leaveDays || 0) - (b.leaveDays || 0),
      render: (days) => (
        <span className="leave-days" style={{ color: "#1890ff" }}>
          {days || 0} ngày
        </span>
      ),
    },
    {
      title: "Đi muộn",
      dataIndex: "lateDays",
      key: "lateDays",
      width: 100,
      sorter: (a, b) => (a.lateDays || 0) - (b.lateDays || 0),
      render: (days) => (
        <span
          className={days > 0 ? "late-days" : ""}
          style={{ color: days > 0 ? "#faad14" : "#52c41a" }}
        >
          {days > 0 ? `${days} lần` : "Không"}
        </span>
      ),
    },
    {
      title: "Vắng mặt",
      dataIndex: "absentDays",
      key: "absentDays",
      width: 110,
      sorter: (a, b) => (a.absentDays || 0) - (b.absentDays || 0),
      render: (days) => (
        <span
          className={days > 0 ? "absent-days" : ""}
          style={{ color: days > 0 ? "#f5222d" : "#52c41a" }}
        >
          {days > 0 ? `${days} ngày` : "Không"}
        </span>
      ),
    },
  ];

  const handleDateRangeChange = (dates) => {
    setFilters({ ...filters, dateRange: dates });
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  const handleDepartmentChange = (value) => {
    setFilters({ ...filters, group: value });
  };

  const handleMentorChange = (value) => {
    setFilters({ ...filters, mentor: value });
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: [dayjs().startOf("month"), dayjs().endOf("month")],
      group: null,
      mentor: null,
      searchText: "",
    });
    // Reload data sau khi reset
    setTimeout(() => fetchAttendanceData(), 100);
  };

  const handleSearchSubmit = () => {
    fetchAttendanceData();
  };

  const handleExport = () => {
    message.info("Tính năng xuất Excel đang được phát triển");
    // TODO: Implement export functionality
  };

  return (
    <div className="attendance-report">
      <h2 style={{ marginBottom: "20px" }}>Báo cáo chuyên cần thực tập sinh</h2>

      <Card className="filter-card" style={{ marginBottom: "20px" }}>
        {/* Date Range Picker */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <div className="filter-item">
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Khoảng thời gian:
              </label>
              <RangePicker
                style={{ width: "100%" }}
                value={filters.dateRange}
                onChange={handleDateRangeChange}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </div>
          </Col>
        </Row>

        {/* Department and Mentor Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <div className="filter-item">
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Phòng ban:
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Tất cả phòng ban"
                value={filters.group}
                onChange={handleDepartmentChange}
                allowClear
                showSearch
                optionFilterProp="children"
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
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Mentor:
              </label>
              <Select
                style={{ width: "100%" }}
                placeholder="Tất cả mentor"
                value={filters.mentor}
                onChange={handleMentorChange}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {mentors.map((mentor) => (
                  <Option key={mentor.id} value={mentor.id}>
                    {mentor.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>

        {/* Search and Action Buttons */}
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <div className="filter-item">
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Tìm kiếm:
              </label>
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã TTS"
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={handleSearch}
                onPressEnter={handleSearchSubmit}
                allowClear
              />
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetFilters}
                disabled={loading}
              >
                Đặt lại
              </Button>
              <Button
                type="primary"
                onClick={handleSearchSubmit}
                loading={loading}
              >
                Tìm kiếm
              </Button>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExport}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
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
              value={summary.totalInterns}
              valueStyle={{ color: "#1890ff" }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng ngày làm việc"
              value={summary.totalWorkingDays}
              valueStyle={{ color: "#52c41a" }}
              loading={loading}
              suffix="ngày"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng lần đi muộn"
              value={summary.totalLateDays}
              valueStyle={{ color: "#faad14" }}
              loading={loading}
              suffix="lần"
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
              suffix="ngày"
            />
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <Card>
        <Spin spinning={loading} tip="Đang tải dữ liệu...">
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
            scroll={{ x: 1000 }}
            bordered
            size="middle"
            locale={{
              emptyText: "Không có dữ liệu",
            }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default AttendanceReport;
