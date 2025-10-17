import { useState, useEffect } from "react";
import "./InternshipList.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getInternships,
  createInternship,
  updateInternship,
} from "../../services/internshipService";
import { getUsers } from "../../services/adminService";
import MentorAssignmentModal from "../mentor/MentorAssignmentModal";

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [mentorAssignment, setMentorAssignment] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInternships();
  }, []);

  async function loadInternships() {
    setLoading(true);
    try {
      const response = await getInternships({
        q: "", // Lấy tất cả, filter ở client
        status: "",
        page: 0,
        size: 100,
      });
      setInternships(response.data || []);
    } catch (error) {
      console.error("Error loading internships:", error);
      toast.error("Không thể tải danh sách thực tập");
    } finally {
      setLoading(false);
    }
  }

  async function loadMentors() {
    setLoadingMentors(true);
    try {
      const response = await getUsers({ role: "MENTOR", status: "" });
      const userList = response.content || [];
      setMentors(userList);
    } catch (e) {
      console.error("loadMentors error", e);
    } finally {
      setLoadingMentors(false);
    }
  }

  // Derived values for filters
  const schools = [
    ...new Set(internships.map((it) => it.school).filter(Boolean)),
  ];
  const majors = [
    ...new Set(internships.map((it) => it.major).filter(Boolean)),
  ];

  // Apply search + filters
  const filteredInternships = internships.filter((it) => {
    const matchesSearch = searchText
      ? it.student?.toLowerCase().includes(searchText.toLowerCase()) ||
        it.studentEmail?.toLowerCase().includes(searchText.toLowerCase())
      : true;
    const matchesSchool = schoolFilter ? it.school === schoolFilter : true;
    const matchesMajor = majorFilter ? it.major === majorFilter : true;
    return matchesSearch && matchesSchool && matchesMajor;
  });

  if (loading) {
    return <div className="loading center">Đang tải...</div>;
  }

  return (
    <div className="page-container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="page-header">
        <h1 className="page-title">Danh sách Thực tập</h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          Thêm thực tập mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          className="form-row"
          style={{
            padding: 16,
            gap: 16,
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div className="form-group">
            <label className="form-label">Tìm kiếm (Tên/Email)</label>
            <input
              className="form-input"
              placeholder="Nhập tên hoặc email"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Lọc theo Trường</label>
            <select
              className="form-select"
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              {schools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Lọc theo Ngành</label>
            <select
              className="form-select"
              value={majorFilter}
              onChange={(e) => setMajorFilter(e.target.value)}
            >
              <option value="">Tất cả</option>
              {majors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <button
              type="button"
              className="btn clear-filters-btn"
              onClick={() => {
                setSearchText("");
                setSchoolFilter("");
                setMajorFilter("");
              }}
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">Vị trí</th>
              <th className="table-th">Tên sinh viên</th>
              <th className="table-th">Email</th>
              <th className="table-th">Trường</th>
              <th className="table-th">Ngành</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Thời gian</th>
              <th className="table-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredInternships.length === 0 ? (
              <tr>
                <td className="table-td center" colSpan={8}>
                  Không tìm thấy thực tập sinh.
                </td>
              </tr>
            ) : (
              filteredInternships.map((internship) => (
                <tr key={internship.intern_id}>
                  <td className="table-td">{internship.title}</td>
                  <td className="table-td">{internship.student}</td>
                  <td className="table-td">{internship.studentEmail}</td>
                  <td className="table-td">{internship.school || "-"}</td>
                  <td className="table-td">{internship.major || "-"}</td>
                  <td className="table-td">
                    <span
                      className={`badge ${
                        internship.status === "active"
                          ? "badge-success"
                          : "badge-danger"
                      }`}
                    >
                      {internship.status === "active"
                        ? "Đang thực tập"
                        : "Hoàn thành"}
                    </span>
                  </td>
                  <td className="table-td">
                    {internship.startDate} - {internship.endDate}
                  </td>
                  <td className="table-td">
                    <button
                      className="btn btn-success"
                      style={{ marginRight: 8 }}
                      onClick={() => setViewing(internship)}
                    >
                      Xem
                    </button>
                    <button
                      className="btn btn-warning"
                      style={{ marginRight: 8 }}
                      onClick={() => setEditing(internship)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-info"
                      onClick={() => setMentorAssignment(internship)}
                    >
                      Phân công mentor
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showCreate && (
        <CreateInternshipModal
          onClose={() => setShowCreate(false)}
          onCreate={async (data) => {
            try {
              const payload = {
                title: data.title,
                student: data.student,
                studentEmail: data.studentEmail,
                school: data.school,
                major: data.major,
                status: data.status,
                startDate: data.startDate,
                endDate: data.endDate,
              };
              console.log("Sending data:", payload);
              await createInternship(payload);

              toast.success("Tạo thực tập sinh thành công! 🎉");
              setShowCreate(false);
              await loadInternships();
            } catch (error) {
              console.error("Error creating internship:", error);
              console.error("Error response:", error?.response?.data);

              toast.error(
                error?.response?.data?.message ||
                  error?.message ||
                  "Tạo thất bại"
              );
            }
          }}
        />
      )}
      {viewing && (
        <ViewInternshipModal data={viewing} onClose={() => setViewing(null)} />
      )}
      {editing && (
        <EditInternshipModal
          data={editing}
          onClose={() => setEditing(null)}
          onSave={async (updated) => {
            try {
              await updateInternship(editing.intern_id, {
                title: updated.title,
                student: updated.student,
                studentEmail: updated.studentEmail,
                school: updated.school,
                major: updated.major,
                status: updated.status,
                startDate: updated.startDate,
                endDate: updated.endDate,
              });
              // Thay alert bằng toast
              toast.success("Cập nhật thành công! ✅");
              setEditing(null);
              await loadInternships();
            } catch (error) {
              // Thay alert bằng toast
              toast.error(
                error?.response?.data?.message || "Cập nhật thất bại"
              );
            }
          }}
        />
      )}
      {mentorAssignment && (
        <MentorAssignmentModal
          internship={mentorAssignment}
          mentors={mentors}
          loadingMentors={loadingMentors}
          onClose={() => {
            setMentorAssignment(null);
            loadInternships(); // Reload để cập nhật trạng thái
          }}
          onLoadMentors={loadMentors}
        />
      )}
    </div>
  );
}

function CreateInternshipModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [student, setStudent] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [status, setStatus] = useState("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // State lưu lỗi validation chi tiết
  const [validationErrors, setValidationErrors] = useState({});
  const [showSelectIntern, setShowSelectIntern] = useState(false);

  // Logic validation
  const validate = (data) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.title.trim()) {
      errors.title = "Vị trí không được để trống";
    }
    if (!data.student.trim()) {
      errors.student = "Tên sinh viên không được để trống";
    }
    if (!data.studentEmail.trim()) {
      errors.studentEmail = "Email không được để trống";
    } else if (!emailRegex.test(data.studentEmail.trim())) {
      errors.studentEmail = "Email không hợp lệ";
    }
    if (!data.startDate) {
      errors.startDate = "Ngày bắt đầu không được để trống";
    }
    if (!data.endDate) {
      errors.endDate = "Ngày kết thúc không được để trống";
    }

    return errors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
      student,
      studentEmail,
      school,
      major,
      status,
      startDate,
      endDate,
    };
    const errors = validate(data);

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error(
        "Vui lòng kiểm tra lại thông tin nhập. Các trường bắt buộc chưa hợp lệ."
      );
      return;
    }

    // Nếu hợp lệ thì gọi onCreate
    onCreate({
      title: title.trim(),
      student: student.trim(),
      studentEmail: studentEmail.trim(),
      school: school.trim() || undefined,
      major: major.trim() || undefined,
      status,
      startDate,
      endDate,
    });
  };

  // Hàm xóa lỗi khi người dùng gõ lại input
  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 className="modal-title" style={{ margin: 0 }}>
            Thêm thực tập
          </h2>
          <button
            type="button"
            className="form-select"
            onClick={() => setShowSelectIntern(true)}
            style={{
              width: "auto",
              padding: "8px 16px",
              cursor: "pointer",
              backgroundColor: "white",
              border: "1px solid #ddd",
            }}
          >
            Chọn từ danh sách INTERN
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-row cols-2-1">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Vị trí <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="title"
                className={`form-input ${
                  validationErrors.title ? "input-error" : ""
                }`}
                value={title}
                onChange={handleInputChange(setTitle, "title")}
              />
              {validationErrors.title && (
                <div className="error-message">{validationErrors.title}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="studentEmail">
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="studentEmail"
                type="email"
                className={`form-input ${
                  validationErrors.studentEmail ? "input-error" : ""
                }`}
                value={studentEmail}
                onChange={handleInputChange(setStudentEmail, "studentEmail")}
                placeholder="name@example.com"
              />
              {validationErrors.studentEmail && (
                <div className="error-message">
                  {validationErrors.studentEmail}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="student">
                Tên sinh viên <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="student"
                className={`form-input ${
                  validationErrors.student ? "input-error" : ""
                }`}
                value={student}
                onChange={handleInputChange(setStudent, "student")}
              />
              {validationErrors.student && (
                <div className="error-message">{validationErrors.student}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="school">
                Trường
              </label>
              <input
                id="school"
                className="form-input"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="VD: Đại học Bách Khoa Hà Nội"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="major">
                Ngành
              </label>
              <input
                id="major"
                className="form-input"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="VD: Công nghệ thông tin"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Trạng thái
              </label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Đang thực tập</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="start">
                Ngày bắt đầu <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="start"
                type="date"
                className={`form-input ${
                  validationErrors.startDate ? "input-error" : ""
                }`}
                value={startDate}
                onChange={handleInputChange(setStartDate, "startDate")}
              />
              {validationErrors.startDate && (
                <div className="error-message">
                  {validationErrors.startDate}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="end">
                Ngày kết thúc <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="end"
                type="date"
                className={`form-input ${
                  validationErrors.endDate ? "input-error" : ""
                }`}
                value={endDate}
                onChange={handleInputChange(setEndDate, "endDate")}
              />
              {validationErrors.endDate && (
                <div className="error-message">{validationErrors.endDate}</div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Tạo
            </button>
          </div>
        </form>

        {showSelectIntern && (
          <SelectInternModal
            onClose={() => setShowSelectIntern(false)}
            onSelect={(user) => {
              setStudent(user.fullName);
              setStudentEmail(user.email);
              setValidationErrors((prev) => ({
                ...prev,
                student: undefined,
                studentEmail: undefined,
              }));
              setShowSelectIntern(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function ViewInternshipModal({ data, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thông tin thực tập</h2>
        <div className="form-row cols-2-1">
          <div className="form-group">
            <label className="form-label">Vị trí</label>
            <div>{data.title}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div>{data.studentEmail}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Sinh viên</label>
            <div>{data.student}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Trường</label>
            <div>{data.school || "-"}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ngành</label>
            <div>{data.major || "-"}</div>
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <div>
              {data.status === "active" ? "Đang thực tập" : "Hoàn thành"}
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Thời gian</label>
            <div>
              {data.startDate} - {data.endDate}
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function EditInternshipModal({ data, onClose, onSave }) {
  const [title, setTitle] = useState(data.title || "");
  const [student, setStudent] = useState(data.student || "");
  const [studentEmail, setStudentEmail] = useState(data.studentEmail || "");
  const [school, setSchool] = useState(data.school || "");
  const [major, setMajor] = useState(data.major || "");
  const [status, setStatus] = useState(data.status || "active");
  const [startDate, setStartDate] = useState(data.startDate || "");
  const [endDate, setEndDate] = useState(data.endDate || "");
  // const [err, setErr] = useState(""); // ❌ Bỏ state lỗi chung này
  const [validationErrors, setValidationErrors] = useState({}); // ✅ Thêm state lỗi chi tiết

  const validate = (data) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.title.trim()) {
      errors.title = "Vị trí không được để trống";
    }
    if (!data.student.trim()) {
      errors.student = "Tên sinh viên không được để trống";
    }
    if (!data.studentEmail.trim()) {
      errors.studentEmail = "Email không được để trống";
    } else if (!emailRegex.test(data.studentEmail.trim())) {
      errors.studentEmail = "Email không hợp lệ";
    }
    if (!data.startDate) {
      errors.startDate = "Ngày bắt đầu không được để trống";
    }
    if (!data.endDate) {
      errors.endDate = "Ngày kết thúc không được để trống";
    }

    return errors;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      title,
      student,
      studentEmail,
      school,
      major,
      status,
      startDate,
      endDate,
    };
    const errors = validate(updatedData);

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Hiển thị toast lỗi chung khi nhấn submit và có lỗi
      toast.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }

    onSave({
      ...data,
      title: title.trim(),
      student: student.trim(),
      studentEmail: studentEmail.trim(),
      school: school.trim() || undefined,
      major: major.trim() || undefined,
      status,
      startDate,
      endDate,
    });
  };

  // Hàm xử lý thay đổi input để xóa lỗi ngay khi người dùng gõ
  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Sửa thông tin thực tập</h2>
        {/* ❌ Bỏ div lỗi chung */}
        {/* {err && <div style={{ color: "#dc3545", marginBottom: 8 }}>{err}</div>} */}
        <form onSubmit={onSubmit}>
          <div className="form-row cols-2-1">
            <div className="form-group">
              <label className="form-label">
                Vị trí <span style={{ color: "red" }}>*</span>
              </label>
              <input
                className={`form-input ${
                  validationErrors.title ? "input-error" : ""
                }`}
                value={title}
                onChange={handleInputChange(setTitle, "title")} // ✅ Sử dụng handleInputChange
              />
              {validationErrors.title && ( // ✅ Hiển thị lỗi dưới field
                <div className="error-message">{validationErrors.title}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                Email <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                className={`form-input ${
                  validationErrors.studentEmail ? "input-error" : ""
                }`}
                value={studentEmail}
                onChange={handleInputChange(setStudentEmail, "studentEmail")} // ✅ Sử dụng handleInputChange
                placeholder="name@example.com"
              />
              {validationErrors.studentEmail && ( // ✅ Hiển thị lỗi dưới field
                <div className="error-message">
                  {validationErrors.studentEmail}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Sinh viên <span style={{ color: "red" }}>*</span>
              </label>
              <input
                className={`form-input ${
                  validationErrors.student ? "input-error" : ""
                }`}
                value={student}
                onChange={handleInputChange(setStudent, "student")}
              />
              {validationErrors.student && (
                <div className="error-message">{validationErrors.student}</div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Trường</label>
              <input
                className="form-input"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngành</label>
              <input
                className="form-input"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Đang thực tập</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Ngày bắt đầu <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                className={`form-input ${
                  validationErrors.startDate ? "input-error" : ""
                }`}
                value={startDate}
                onChange={handleInputChange(setStartDate, "startDate")}
              />
              {validationErrors.startDate && (
                <div className="error-message">
                  {validationErrors.startDate}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">
                Ngày kết thúc <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                className={`form-input ${
                  validationErrors.endDate ? "input-error" : ""
                }`}
                value={endDate}
                onChange={handleInputChange(setEndDate, "endDate")}
              />
              {validationErrors.endDate && (
                <div className="error-message">{validationErrors.endDate}</div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectInternModal({ onClose, onSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    loadInternUsers();
  }, []);

  async function loadInternUsers() {
    setLoading(true);
    try {
      const response = await getUsers({ role: "INTERN", status: "" });
      const userList = response.content || [];
      setUsers(userList);
    } catch (error) {
      console.error("Error loading INTERN users:", error);
      alert("Không thể tải danh sách INTERN");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "600px", width: "70%" }}>
        <h2 className="modal-title">Chọn INTERN từ danh sách người dùng</h2>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <input
            className="form-input"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}>Đang tải...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: "#666" }}>
            Không tìm thấy user có role INTERN
          </div>
        ) : (
          <div
            style={{ maxHeight: "500px", overflowY: "auto", marginBottom: 16 }}
          >
            <table className="table">
              <thead>
                <tr>
                  <th className="table-th">Họ tên</th>
                  <th className="table-th">Email</th>
                  <th className="table-th">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="table-td">{user.fullName}</td>
                    <td className="table-td">{user.email}</td>
                    <td className="table-td">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onSelect(user)}
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-actions">
          <button className="btn-outline" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
