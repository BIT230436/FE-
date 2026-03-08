import { useState, useEffect } from "react";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./WorkSchedule.css";
import {
  getWorkSchedules,
  createWorkSchedule,
  updateWorkSchedule,
  deleteWorkSchedule,
  getInternGroups,
  getInterns,
} from "../../services/workScheduleService";

export default function WorkSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Filters
  const [groupFilter, setGroupFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [schedulesRes, groupsRes] = await Promise.all([
        getWorkSchedules(),
        getInternGroups(),
      ]);

      setSchedules(Array.isArray(schedulesRes) ? schedulesRes : (schedulesRes?.data ?? []));
      setGroups(Array.isArray(groupsRes) ? groupsRes : (groupsRes?.data ?? []));
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(scheduleId) {
    if (!window.confirm("Bạn có chắc muốn xóa lịch làm việc này?")) return;

    try {
      await deleteWorkSchedule(scheduleId);
      toast.success("Đã xóa lịch làm việc!");
      await loadData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error(error?.response?.data?.message || "Xóa thất bại");
    }
  }

  // Filter schedules
  const filteredSchedules = schedules.filter((schedule) => {
    if (!groupFilter) return true;
    return (
      schedule.groupName === groupFilter || schedule.internName === groupFilter
    );
  });

  // Group schedules by group/individual
  const groupedSchedules = filteredSchedules.reduce((acc, schedule) => {
    const key = schedule.groupName || schedule.internName || "Khác";
    if (!acc[key]) acc[key] = [];
    acc[key].push(schedule);
    return acc;
  }, {});

  if (loading) {
    return <div className="loading center">Đang tải...</div>;
  }

  return (
    <div className="page-container">

      <div className="page-header">
        <h1 className="page-title">Thiết lập lịch làm việc</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateModal(true)}
        >
          + Tạo lịch mới
        </button>
      </div>

      {/* Statistics */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon stat-total">📅</div>
          <div className="stat-info">
            <div className="stat-value">{schedules.length}</div>
            <div className="stat-label">Tổng lịch</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-group">👥</div>
          <div className="stat-info">
            <div className="stat-value">
              {schedules.filter((s) => s.groupName).length}
            </div>
            <div className="stat-label">Lịch theo nhóm</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-individual">👤</div>
          <div className="stat-info">
            <div className="stat-value">
              {schedules.filter((s) => s.internName && !s.groupName).length}
            </div>
            <div className="stat-label">Lịch cá nhân</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card filter-card">
        <div className="filter-row">
          <div className="form-group">
            <label className="form-label">Lọc theo nhóm/cá nhân</label>
            <select
              className="form-select"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              {groups.map((group) => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          {groupFilter && (
            <button
              className="btn btn-clear"
              onClick={() => setGroupFilter("")}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Schedules List */}
      <div className="schedules-container">
        {Object.keys(groupedSchedules).length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">📅</div>
              <div className="empty-text">
                Chưa có lịch làm việc nào được thiết lập
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Tạo lịch đầu tiên
              </button>
            </div>
          </div>
        ) : (
          Object.entries(groupedSchedules).map(
            ([groupName, groupSchedules]) => (
              <div key={groupName} className="card schedule-group-card">
                <div className="group-header">
                  <h3 className="group-title">
                    {groupSchedules[0].groupName ? "👥 " : "👤 "}
                    {groupName}
                  </h3>
                  <span className="group-count">
                    {groupSchedules.length} lịch
                  </span>
                </div>

                <div className="schedules-grid">
                  {groupSchedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-card">
                      <div className="schedule-header">
                        <div className="schedule-time">
                          <span className="time-icon">⏰</span>
                          <span className="time-text">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                        <div className="schedule-actions">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => setEditingSchedule(schedule)}
                            title="Sửa"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(schedule.id)}
                            title="Xóa"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="schedule-body">
                        <div className="schedule-info">
                          <span className="info-label">Số ngày/tuần:</span>
                          <span className="info-value">
                            {schedule.daysPerWeek} ngày
                          </span>
                        </div>

                        {schedule.workDays && schedule.workDays.length > 0 && (
                          <div className="schedule-info">
                            <span className="info-label">Ngày làm việc:</span>
                            <div className="work-days">
                              {schedule.workDays.map((day) => (
                                <span key={day} className="day-badge">
                                  {getDayName(day)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {schedule.note && (
                          <div className="schedule-note">
                            <span className="note-icon">📝</span>
                            <span className="note-text">{schedule.note}</span>
                          </div>
                        )}
                      </div>

                      <div className="schedule-footer">
                        <span className="schedule-date">
                          Tạo: {dayjs(schedule.createdAt).format("DD/MM/YYYY")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <ScheduleFormModal
          groups={groups}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            try {
              await createWorkSchedule(data);
              toast.success("Tạo lịch làm việc thành công! ✅");
              setShowCreateModal(false);
              await loadData();
            } catch (error) {
              console.error("Error creating schedule:", error);
              toast.error(
                error?.response?.data?.message || "Tạo lịch thất bại"
              );
            }
          }}
        />
      )}

      {/* Edit Modal */}
      {editingSchedule && (
        <ScheduleFormModal
          schedule={editingSchedule}
          groups={groups}
          onClose={() => setEditingSchedule(null)}
          onSubmit={async (data) => {
            try {
              await updateWorkSchedule(editingSchedule.id, data);
              toast.success("Cập nhật lịch làm việc thành công! ✅");
              setEditingSchedule(null);
              await loadData();
            } catch (error) {
              console.error("Error updating schedule:", error);
              toast.error(
                error?.response?.data?.message || "Cập nhật thất bại"
              );
            }
          }}
        />
      )}
    </div>
  );
}

function ScheduleFormModal({ schedule, groups, onClose, onSubmit }) {
  const isEdit = !!schedule;

  const [applyType, setApplyType] = useState(
    schedule?.groupName ? "group" : "individual"
  );
  const [selectedGroup, setSelectedGroup] = useState(schedule?.groupId || "");
  const [selectedIntern, setSelectedIntern] = useState(
    schedule?.internId || ""
  );
  const [startTime, setStartTime] = useState(
    schedule?.startTime ? dayjs(schedule.startTime, "HH:mm") : null
  );
  const [endTime, setEndTime] = useState(
    schedule?.endTime ? dayjs(schedule.endTime, "HH:mm") : null
  );
  const [daysPerWeek, setDaysPerWeek] = useState(schedule?.daysPerWeek || 5);
  const [workDays, setWorkDays] = useState(schedule?.workDays || []);
  const [note, setNote] = useState(schedule?.note || "");
  const [validationErrors, setValidationErrors] = useState({});

  const [interns, setInterns] = useState([]);

  useEffect(() => {
    if (applyType === "individual") {
      loadInterns();
    }
  }, [applyType]);

  async function loadInterns() {
    try {
      const data = await getInterns();
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setInterns(list.map((intern) => ({
        id: intern.id,
        name: intern.fullName || intern.name,
        email: intern.email,
      })));
    } catch (error) {
      console.error("Error loading interns:", error);
    }
  }

  const weekDays = [
    { value: "MONDAY", label: "Thứ 2" },
    { value: "TUESDAY", label: "Thứ 3" },
    { value: "WEDNESDAY", label: "Thứ 4" },
    { value: "THURSDAY", label: "Thứ 5" },
    { value: "FRIDAY", label: "Thứ 6" },
    { value: "SATURDAY", label: "Thứ 7" },
    { value: "SUNDAY", label: "CN" },
  ];

  const toggleWorkDay = (day) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validate = () => {
    const errors = {};

    if (applyType === "group" && !selectedGroup) {
      errors.selectedGroup = "Vui lòng chọn nhóm";
    }
    if (applyType === "individual" && !selectedIntern) {
      errors.selectedIntern = "Vui lòng chọn thực tập sinh";
    }
    if (!startTime) errors.startTime = "Vui lòng chọn giờ bắt đầu";
    if (!endTime) errors.endTime = "Vui lòng chọn giờ kết thúc";
    if (startTime && endTime && endTime.isBefore(startTime)) {
      errors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
    }
    if (daysPerWeek < 1 || daysPerWeek > 7) {
      errors.daysPerWeek = "Số ngày phải từ 1 đến 7";
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    const data = {
      applyType,
      groupId: applyType === "group" ? selectedGroup : null,
      internId: applyType === "individual" ? selectedIntern : null,
      startTime: startTime.format("HH:mm"),
      endTime: endTime.format("HH:mm"),
      daysPerWeek,
      workDays: workDays.length > 0 ? workDays : null,
      note: note.trim() || null,
    };

    onSubmit(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-large">
        <h2 className="modal-title">
          {isEdit ? "Sửa lịch làm việc" : "Tạo lịch làm việc mới"}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Apply Type */}
          <div className="form-group">
            <label className="form-label">
              Áp dụng cho <span className="required">*</span>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="group"
                  checked={applyType === "group"}
                  onChange={(e) => setApplyType(e.target.value)}
                />
                <span>Nhóm</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="individual"
                  checked={applyType === "individual"}
                  onChange={(e) => setApplyType(e.target.value)}
                />
                <span>Cá nhân</span>
              </label>
            </div>
          </div>

          {/* Group/Individual Selection */}
          {applyType === "group" ? (
            <div className="form-group">
              <label className="form-label">
                Chọn nhóm <span className="required">*</span>
              </label>
              <select
                className={`form-select ${
                  validationErrors.selectedGroup ? "input-error" : ""
                }`}
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setValidationErrors((prev) => ({
                    ...prev,
                    selectedGroup: undefined,
                  }));
                }}
              >
                <option value="">-- Chọn nhóm --</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              {validationErrors.selectedGroup && (
                <div className="error-message">
                  {validationErrors.selectedGroup}
                </div>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">
                Chọn thực tập sinh <span className="required">*</span>
              </label>
              <select
                className={`form-select ${
                  validationErrors.selectedIntern ? "input-error" : ""
                }`}
                value={selectedIntern}
                onChange={(e) => {
                  setSelectedIntern(e.target.value);
                  setValidationErrors((prev) => ({
                    ...prev,
                    selectedIntern: undefined,
                  }));
                }}
              >
                <option value="">-- Chọn thực tập sinh --</option>
                {interns.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.name} ({intern.email})
                  </option>
                ))}
              </select>
              {validationErrors.selectedIntern && (
                <div className="error-message">
                  {validationErrors.selectedIntern}
                </div>
              )}
            </div>
          )}

          {/* Time Range */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Giờ bắt đầu <span className="required">*</span>
              </label>
              <TimePicker
                format="HH:mm"
                value={startTime}
                onChange={(time) => {
                  setStartTime(time);
                  setValidationErrors((prev) => ({
                    ...prev,
                    startTime: undefined,
                  }));
                }}
                className="form-time-picker"
                placeholder="Chọn giờ bắt đầu"
                status={validationErrors.startTime ? "error" : undefined}
              />
              {validationErrors.startTime && (
                <div className="error-message">
                  {validationErrors.startTime}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Giờ kết thúc <span className="required">*</span>
              </label>
              <TimePicker
                format="HH:mm"
                value={endTime}
                onChange={(time) => {
                  setEndTime(time);
                  setValidationErrors((prev) => ({
                    ...prev,
                    endTime: undefined,
                  }));
                }}
                className="form-time-picker"
                placeholder="Chọn giờ kết thúc"
                status={validationErrors.endTime ? "error" : undefined}
              />
              {validationErrors.endTime && (
                <div className="error-message">{validationErrors.endTime}</div>
              )}
            </div>
          </div>

          {/* Days Per Week */}
          <div className="form-group">
            <label className="form-label">
              Số ngày làm trong tuần <span className="required">*</span>
            </label>
            <input
              type="number"
              className={`form-input ${
                validationErrors.daysPerWeek ? "input-error" : ""
              }`}
              value={daysPerWeek}
              onChange={(e) => {
                setDaysPerWeek(parseInt(e.target.value) || 0);
                setValidationErrors((prev) => ({
                  ...prev,
                  daysPerWeek: undefined,
                }));
              }}
              min="1"
              max="7"
            />
            {validationErrors.daysPerWeek && (
              <div className="error-message">
                {validationErrors.daysPerWeek}
              </div>
            )}
          </div>

          {/* Work Days Selection */}
          <div className="form-group">
            <label className="form-label">Chọn ngày làm việc (tùy chọn)</label>
            <div className="weekdays-selector">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={`weekday-btn ${
                    workDays.includes(day.value) ? "active" : ""
                  }`}
                  onClick={() => toggleWorkDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label">Ghi chú</label>
            <textarea
              className="form-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú nếu có..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Cập nhật" : "Tạo lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getDayName(day) {
  const dayMap = {
    MONDAY: "T2",
    TUESDAY: "T3",
    WEDNESDAY: "T4",
    THURSDAY: "T5",
    FRIDAY: "T6",
    SATURDAY: "T7",
    SUNDAY: "CN",
  };
  return dayMap[day] || day;
}
