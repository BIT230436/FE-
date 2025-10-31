import { useEffect, useState } from "react";
import { getMySchedule } from "../../services/scheduleService";
import { toast } from "react-toastify";
import "./InternshipSchedule.css";

export default function InternshipSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Lấy thông tin user
  const getUserInfo = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          userId: user.userId || user.id || user.user_id,
          userName: user.fullname || user.name || "Thực tập sinh"
        };
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    return { userId: null, userName: "Thực tập sinh" };
  };

  const { userId, userName } = getUserInfo();

  // ✅ Lấy dữ liệu lịch từ API
  useEffect(() => {
    const loadSchedule = async () => {
      if (!userId) {
        toast.error("Vui lòng đăng nhập lại");
        setLoading(false);
        return;
      }

      try {
        console.log("Loading schedule for userId:", userId);
        const response = await getMySchedule(userId);

        console.log("Schedule response:", response);

        if (response.success) {
          // Chuyển đổi dữ liệu để phù hợp với component
          const formattedSchedule = response.data.map(item => ({
            id: item.id,
            internName: item.internName || userName,
            department: item.department || "Thực tập",
            // Sử dụng startDate (created_at) làm ngày hiển thị chính
            date: item.startDate,
            task: item.task,
            description: item.description,
            priority: item.priority,
            status: item.status,
            startDate: item.startDate,
            endDate: item.endDate
          }));

          setSchedule(formattedSchedule);
          toast.success(`Đã tải ${formattedSchedule.length} công việc`);
        } else {
          toast.error(response.message || "Không thể tải lịch thực tập");
          setSchedule([]);
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError(err.message);
        toast.error("Không thể tải lịch thực tập");
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [userId]);

  // Lấy danh sách ngày trong tuần (T2 → CN)
  const getWeekDates = (date) => {
    const current = new Date(date);
    const day = current.getDay(); // 0=CN,1=T2,...
    const monday = new Date(current);
    const daysToMonday = day === 0 ? 6 : day - 1;
    monday.setDate(current.getDate() - daysToMonday);

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
      <h1 className="title">📅 Lịch thực tập của {userName}</h1>

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
                      // ✅ Tìm tasks trong khoảng startDate đến endDate
                      const tasksForDay = schedule.filter((s) => {
                        const startDate = new Date(s.startDate);
                        const endDate = new Date(s.endDate);

                        // Đặt time về 00:00:00 để so sánh chỉ theo ngày
                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(23, 59, 59, 999);
                        const currentDay = new Date(day);
                        currentDay.setHours(0, 0, 0, 0);

                        // Kiểm tra ngày hiện tại có nằm trong khoảng startDate -> endDate không
                        return currentDay >= startDate && currentDay <= endDate;
                      });

                      // Hiển thị task đầu tiên ở 9h
                      const hasTask = h === 9 && tasksForDay.length > 0;
                      const task = hasTask ? tasksForDay[0] : null;

                      // Tạo tooltip với tất cả tasks
                      const tooltipText = tasksForDay.map(t =>
                        `${t.task}\n${t.description || ''}\nTừ: ${new Date(t.startDate).toLocaleDateString('vi-VN')} → Đến: ${new Date(t.endDate).toLocaleDateString('vi-VN')}`
                      ).join('\n\n---\n\n');

                      return (
                        <div
                          key={i}
                          className={`day-cell ${hasTask ? "has-task" : ""}`}
                          title={tasksForDay.length > 0 ? tooltipText : ''}
                        >
                          {hasTask ? (
                            <div className="task-info">
                              <div className="task-title">{task.task}</div>
                              {tasksForDay.length > 1 && (
                                <div className="task-count">+{tasksForDay.length - 1} khác</div>
                              )}
                              <div className="task-status">
                                {task.status === "COMPLETED" ? "✅" :
                                 task.status === "IN_PROGRESS" ? "🔄" : "⏳"}
                              </div>
                            </div>
                          ) : ""}
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
            {(() => {
              const firstOfMonth = new Date(currentYear, currentMonth, 1);
              const rawFirstDay = firstOfMonth.getDay();
              const offset = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

              const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
              const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

              return Array.from({ length: totalCells }, (_, idx) => {
                let dateObj;
                let isCurrentMonth = false;

                if (idx < offset) {
                  const day = prevMonthDays - offset + 1 + idx;
                  dateObj = new Date(currentYear, currentMonth - 1, day);
                  isCurrentMonth = false;
                } else if (idx >= offset + daysInMonth) {
                  const day = idx - (offset + daysInMonth) + 1;
                  dateObj = new Date(currentYear, currentMonth + 1, day);
                  isCurrentMonth = false;
                } else {
                  const day = idx - offset + 1;
                  dateObj = new Date(currentYear, currentMonth, day);
                  isCurrentMonth = true;
                }

                // ✅ Kiểm tra có task trong khoảng startDate -> endDate không
                const hasEvent = schedule.some((s) => {
                  const startDate = new Date(s.startDate);
                  const endDate = new Date(s.endDate);

                  // Đặt time về 00:00:00
                  startDate.setHours(0, 0, 0, 0);
                  endDate.setHours(23, 59, 59, 999);
                  const checkDate = new Date(dateObj);
                  checkDate.setHours(0, 0, 0, 0);

                  // Kiểm tra ngày có nằm trong range không
                  return checkDate >= startDate && checkDate <= endDate;
                });

                const isToday = dateObj.toDateString() === new Date().toDateString();
                const isSelected = selectedDate.toDateString() === dateObj.toDateString();

                return (
                  <div
                    key={idx}
                    className={`calendar-day ${hasEvent ? "has-event" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected-day" : ""} ${!isCurrentMonth ? "other-month" : ""}`}
                    onClick={() => handleDayClick(dateObj)}
                  >
                    {dateObj.getDate()}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}