import { useEffect, useState } from "react";
import "./InternshipSchedule.css";

export default function InternshipSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Giả lập user hiện tại (sau này thay bằng login)
  const currentUser = localStorage.getItem("userName") || "Nguyễn Văn A";

  // 🧠 Dữ liệu giả lập (fake)
  const mockSchedule = [
    {
      id: 1,
      internName: "Nguyễn Văn A",
      department: "Phòng IT",
      date: "2025-10-20",
      task: "Viết báo cáo tuần",
    },
    {
      id: 2,
      internName: "Nguyễn Văn A",
      department: "Phòng IT",
      date: "2025-10-21",
      task: "Tham gia họp nhóm",
    },
    {
      id: 3,
      internName: "Nguyễn Văn A",
      department: "Phòng IT",
      date: "2025-10-23",
      task: "Hoàn thiện module đăng nhập",
    },
    {
      id: 4,
      internName: "Nguyễn Văn A",
      department: "Phòng IT",
      date: "2025-10-25",
      task: "Thử nghiệm hệ thống mới",
    },
  ];

  // Giả lập fetch dữ liệu (API sau này thay vào đây)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await fetch(`http://localhost:8080/api/schedule/${currentUser}`);
        // const data = await res.json();
        const userSchedule = mockSchedule.filter(
          (i) => i.internName === currentUser
        );
        setSchedule(userSchedule);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  const handleDayClick = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
  };

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  // === Xử lý tuần hiện tại (bên trái) ===
  const getCurrentWeekDates = (date) => {
    const current = new Date(date);
    const dayOfWeek = current.getDay() || 7; // CN = 0 → 7
    const monday = new Date(current);
    monday.setDate(current.getDate() - (dayOfWeek - 1));

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const currentWeek = getCurrentWeekDates(selectedDate);

  const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  if (loading) return <div className="p-6">Đang tải lịch...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="intern-schedule-container">
      <h1 className="title">📅 Lịch thực tập của {currentUser}</h1>

      <div className="schedule-layout">
        {/* === BÊN TRÁI: LỊCH TUẦN === */}
        <div className="week-schedule">
          <h2 className="week-title">Tuần hiện tại</h2>
          {currentWeek.map((day, index) => {
            const formatted = day.toLocaleDateString("vi-VN");
            const events = schedule.filter(
              (item) =>
                new Date(item.date).toDateString() === day.toDateString()
            );
            const isToday =
              new Date().toDateString() === day.toDateString() ? "today" : "";

            return (
              <div key={index} className={`week-day ${isToday}`}>
                <div className="week-date">
                  <span className="weekday">{weekdays[index]}</span>
                  <span className="date">
                    {day.getDate()}/{day.getMonth() + 1}
                  </span>
                </div>
                <div className="tasks">
                  {events.length > 0 ? (
                    events.map((e) => (
                      <p key={e.id} className="task">
                        {e.task}
                      </p>
                    ))
                  ) : (
                    <p className="no-task">Không có công việc</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* === BÊN PHẢI: LỊCH THÁNG === */}
        <div className="calendar-fake">
          <div className="calendar-header">
            <button className="month-btn" onClick={handlePrevMonth}>
              ←
            </button>
            <span>
              {monthNames[currentMonth]} / {currentYear}
            </span>
            <button className="month-btn" onClick={handleNextMonth}>
              →
            </button>
          </div>

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

              return (
                <div
                  key={day}
                  className={`calendar-day ${
                    hasEvent ? "has-event" : ""
                  } ${selectedDate.getDate() === day ? "selected-day" : ""}`}
                  onClick={() => handleDayClick(day)}
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
