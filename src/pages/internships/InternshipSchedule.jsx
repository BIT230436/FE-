import { useEffect, useState } from "react";
import "./InternshipSchedule.css";

export default function InternshipSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Giả lập user
  const currentUser = localStorage.getItem("userName") || "Nguyễn Văn A";

  // 🧩 Dữ liệu giả lập (mock)
  const mockSchedule = [
    { id: 1, internName: "Nguyễn Văn A", department: "Phòng IT", date: "2025-10-20T09:00", task: "Tham gia họp nhóm" },
    { id: 2, internName: "Nguyễn Văn A", department: "Phòng IT", date: "2025-10-22T14:00", task: "Làm báo cáo tiến độ" },
    { id: 3, internName: "Nguyễn Văn A", department: "Phòng IT", date: "2025-10-24T10:00", task: "Sửa lỗi module đăng nhập" },
    { id: 4, internName: "Nguyễn Văn A", department: "Phòng IT", date: "2025-10-25T16:00", task: "Thử nghiệm hệ thống" },
  ];

  // Lấy dữ liệu (mock)
  useEffect(() => {
    try {
      const userSchedule = mockSchedule.filter((i) => i.internName === currentUser);
      setSchedule(userSchedule);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Lấy danh sách ngày trong tuần (T2 → CN)
  const getWeekDates = (date) => {
    const current = new Date(date);
    const day = current.getDay(); // 0=CN,1=T2,...
    const monday = new Date(current);
    monday.setDate(current.getDate() - ((day + 6) % 7)); // lùi về thứ 2 gần nhất

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const currentWeek = getWeekDates(selectedDate);
  const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Danh sách giờ hiển thị từ 7h - 19h
  const hours = Array.from({ length: 13 }, (_, i) => i + 7);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  if (loading) return <div className="p-6">Đang tải lịch...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="intern-schedule-container">
      <h1 className="title">📅 Lịch thực tập của {currentUser}</h1>

      <div className="schedule-layout">
        {/* === LỊCH TUẦN === */}
        <div className="week-schedule">
          <h2 className="week-title">
            Tuần {currentWeek[0].toLocaleDateString("vi-VN")} -{" "}
            {currentWeek[6].toLocaleDateString("vi-VN")}
          </h2>

          <div className="week-grid">
            {/* Cột giờ bên trái */}
            <div className="time-column">
              {hours.map((h) => {
                const now = new Date();
                const isCurrentHour = now.getHours() === h;
                return (
                  <div
                    key={h}
                    className={`time-cell ${isCurrentHour ? "current-hour" : ""}`}
                  >
                    {h}:00
                  </div>
                );
              })}
            </div>

            {/* Cột các ngày trong tuần */}
            <div className="days-column">
              {/* Hàng tiêu đề (Thứ) */}
              <div className="week-header">
                {currentWeek.map((day, i) => {
                  const isToday =
                    new Date().toDateString() === day.toDateString();
                  return (
                    <div
                      key={i}
                      className={`day-header ${isToday ? "today" : ""}`}
                      onClick={() => handleDayClick(day)}
                    >
                      {weekdays[i]} <br />
                      {day.getDate()}/{day.getMonth() + 1}
                    </div>
                  );
                })}
              </div>

              {/* Hàng giờ (7h - 19h) */}
              <div className="week-body">
                {hours.map((h) => (
                  <div key={h} className="hour-row">
                    {currentWeek.map((day, i) => {
                      const hasTask = schedule.some((s) => {
                        const d = new Date(s.date);
                        return (
                          d.getDate() === day.getDate() &&
                          d.getMonth() === day.getMonth() &&
                          d.getFullYear() === day.getFullYear() &&
                          d.getHours() === h
                        );
                      });

                      const task = schedule.find((s) => {
                        const d = new Date(s.date);
                        return (
                          d.getDate() === day.getDate() &&
                          d.getMonth() === day.getMonth() &&
                          d.getFullYear() === day.getFullYear() &&
                          d.getHours() === h
                        );
                      });

                      return (
                        <div
                          key={i}
                          className={`day-cell ${hasTask ? "has-task" : ""}`}
                        >
                          {hasTask ? task.task : ""}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === LỊCH THÁNG === */}
        <div className="calendar-fake">
          <div className="calendar-header">
            <button
              className="month-btn"
              onClick={() =>
                setCurrentMonth((prev) => {
                  if (prev === 0) {
                    setCurrentYear((y) => y - 1);
                    return 11;
                  }
                  return prev - 1;
                })
              }
            >
              ←
            </button>
            <span>
              {monthNames[currentMonth]} / {currentYear}
            </span>
            <button
              className="month-btn"
              onClick={() =>
                setCurrentMonth((prev) => {
                  if (prev === 11) {
                    setCurrentYear((y) => y + 1);
                    return 0;
                  }
                  return prev + 1;
                })
              }
            >
              →
            </button>
          </div>

          {/* ✅ Hàng thứ trong tuần */}
          <div className="calendar-weekdays">
            {weekdays.map((w, i) => (
              <div key={i}>{w}</div>
            ))}
          </div>

          {/* ✅ Các ngày trong tháng */}
          <div className="calendar-grid">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(currentYear, currentMonth, day);
              const hasEvent = schedule.some(
                (s) =>
                  new Date(s.date).getDate() === day &&
                  new Date(s.date).getMonth() === currentMonth &&
                  new Date(s.date).getFullYear() === currentYear
              );

              const isToday =
                date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={day}
                  className={`calendar-day ${
                    hasEvent ? "has-event" : ""
                  } ${isToday ? "today" : ""} ${
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === currentMonth
                      ? "selected-day"
                      : ""
                  }`}
                  onClick={() => handleDayClick(date)}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
