import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AttendancePage.css";
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
} from "../../services/attendanceService";

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Cập nhật đồng hồ mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadAttendanceData();
  }, []);

  async function loadAttendanceData() {
    setLoading(true);
    setError(null);

    try {
      // Load thông tin chấm công hôm nay
      let todayResponse = null;
      try {
        todayResponse = await getTodayAttendance();
      } catch (e) {
        console.warn("getTodayAttendance error:", e.message);
      }

      if (todayResponse && todayResponse.data) {
        setTodayRecord(todayResponse.data);
      } else {
        setTodayRecord(null);
      }

      // Load lịch sử chấm công
      let historyResponse = null;
      try {
        historyResponse = await getAttendanceHistory({ page: 0, size: 10 });
      } catch (e) {
        console.warn("getAttendanceHistory error:", e.message);
      }

      if (historyResponse && historyResponse.data) {
        setHistory(
          Array.isArray(historyResponse.data) ? historyResponse.data : []
        );
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Error loading attendance data:", error);
      setError(error.message || "Không thể tải dữ liệu chấm công");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (processing) return;

    setProcessing(true);
    try {
      const response = await checkIn();
      console.log("Check-in response:", response);

      // Xử lý response wrapper
      if (response && response.data) {
        setTodayRecord(response.data);
      }

      toast.success("Check-in thành công! ✅");

      // Reload data để cập nhật
      await loadAttendanceData();
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error(error.message || "Check-in thất bại");
    } finally {
      setProcessing(false);
    }
  }

  async function handleCheckOut() {
    if (processing) return;

    setProcessing(true);
    try {
      const response = await checkOut();
      console.log("Check-out response:", response);

      // Xử lý response wrapper
      if (response && response.data) {
        setTodayRecord(response.data);
      }

      toast.success("Check-out thành công! 👋");

      // Reload data để cập nhật
      await loadAttendanceData();
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error(error.message || "Check-out thất bại");
    } finally {
      setProcessing(false);
    }
  }

  function calculateWorkHours(checkInTime, checkOutTime) {
    if (!checkInTime || !checkOutTime) return "-";

    const start = dayjs(checkInTime);
    const end = dayjs(checkOutTime);
    const diffMinutes = end.diff(start, "minute");

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  }

  function getWorkingStatus() {
    if (!todayRecord) return "Chưa check-in";
    if (todayRecord.checkInTime && !todayRecord.checkOutTime) {
      return "Đang làm việc";
    }
    if (todayRecord.checkInTime && todayRecord.checkOutTime) {
      return "Đã hoàn thành";
    }
    return "Chưa check-in";
  }

  function getStatusBadgeClass() {
    const status = getWorkingStatus();
    if (status === "Đang làm việc") return "badge-working";
    if (status === "Đã hoàn thành") return "badge-completed";
    return "badge-pending";
  }

  if (loading) {
    return (
      <div className="loading center">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>❌ Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadAttendanceData}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <h1 className="page-title">Chấm công</h1>
      </div>

      {/* Card hiển thị đồng hồ và trạng thái */}
      <div className="card clock-card">
        <div className="clock-display">
          <div className="current-time">{currentTime.format("HH:mm:ss")}</div>
          <div className="current-date">
            {currentTime.format("dddd, DD/MM/YYYY")}
          </div>

          {/* Status badge ngay dưới date */}
          <div className="status-badge-wrapper">
            <span className={`badge ${getStatusBadgeClass()}`}>
              {getWorkingStatus()}
            </span>
          </div>
        </div>

        {/* Thông tin check-in/out hôm nay */}
        <div className="today-info">
          <div className="info-row">
            <div className="info-item">
              <span className="info-label">Giờ vào:</span>
              <span className="info-value">
                {todayRecord?.checkInTime
                  ? dayjs(todayRecord.checkInTime).format("HH:mm:ss")
                  : "-"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Giờ ra:</span>
              <span className="info-value">
                {todayRecord?.checkOutTime
                  ? dayjs(todayRecord.checkOutTime).format("HH:mm:ss")
                  : "-"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Tổng giờ:</span>
              <span className="info-value">
                {calculateWorkHours(
                  todayRecord?.checkInTime,
                  todayRecord?.checkOutTime
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Nút Check-in/Check-out */}
        <div className="action-buttons">
          <button
            className="btn btn-check-in"
            onClick={handleCheckIn}
            disabled={
              processing ||
              (todayRecord?.checkInTime && !todayRecord?.checkOutTime) ||
              (todayRecord?.checkInTime && todayRecord?.checkOutTime)
            }
          >
            {processing ? "Đang xử lý..." : "Check-in"}
          </button>
          <button
            className="btn btn-check-out"
            onClick={handleCheckOut}
            disabled={
              processing ||
              !todayRecord?.checkInTime ||
              todayRecord?.checkOutTime
            }
          >
            {processing ? "Đang xử lý..." : "Check-out"}
          </button>
        </div>
      </div>

      {/* Lịch sử chấm công */}
      <div className="card">
        <h2 className="section-title">Lịch sử chấm công gần đây</h2>

        {history.length === 0 ? (
          <div className="empty">Chưa có dữ liệu chấm công</div>
        ) : (
          <div className="history-table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">STT</th>
                  <th className="table-th">Ngày</th>
                  <th className="table-th">Giờ vào</th>
                  <th className="table-th">Giờ ra</th>
                  <th className="table-th">Tổng giờ làm</th>
                  <th className="table-th">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => (
                  <tr key={record.id}>
                    <td className="table-td center">{index + 1}</td>
                    <td className="table-td">
                      {dayjs(record.date).format("DD/MM/YYYY")}
                    </td>
                    <td className="table-td">
                      {record.checkInTime
                        ? dayjs(record.checkInTime).format("HH:mm:ss")
                        : "-"}
                    </td>
                    <td className="table-td">
                      {record.checkOutTime
                        ? dayjs(record.checkOutTime).format("HH:mm:ss")
                        : "-"}
                    </td>
                    <td className="table-td">
                      {calculateWorkHours(
                        record.checkInTime,
                        record.checkOutTime
                      )}
                    </td>
                    <td className="table-td">
                      <span
                        className={`badge ${
                          record.checkOutTime
                            ? "badge-completed"
                            : "badge-working"
                        }`}
                      >
                        {record.checkOutTime ? "Hoàn thành" : "Đang làm"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
