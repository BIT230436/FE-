import { useState, useEffect } from "react";
import "../shared/list.css";
import { 
  getInternships, 
  createInternship, 
  updateInternship, 
  deleteInternship 
} from "../../services/internshipService";

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("");
  const [majorFilter, setMajorFilter] = useState("");

  useEffect(() => {
    loadInternships();
  }, [searchText, schoolFilter, majorFilter]);
  
  async function loadInternships() {
    setLoading(true);
    try {
      const response = await getInternships({
        q: searchText,
        status: "", // hoặc thêm filter status
        page: 0,
        size: 100
      });
      setInternships(response.data || []);
    } catch (error) {
      console.error("Error loading internships:", error);
      alert("Không thể tải danh sách thực tập");
    } finally {
      setLoading(false);
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
                      onClick={() => setEditing(internship)}
                    >
                      Sửa
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
          endDate: data.endDate
        };
        console.log("Sending data:", payload);
        const response = await createInternship(payload);
        console.log("Response:", response);
        alert("Tạo thực tập sinh thành công!");
        setShowCreate(false);
        await loadInternships();
      } catch (error) {
        console.error("Error creating internship:", error);
        console.error("Error response:", error?.response?.data);
        alert(error?.response?.data?.message || error?.message || "Tạo thất bại");
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
                endDate: updated.endDate
              });
              alert("Cập nhật thành công!");
              setEditing(null);
              await loadInternships();
            } catch (error) {
              alert(error?.response?.data?.message || "Cập nhật thất bại");
            }
          }}
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
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (!title.trim() || !student.trim() || !studentEmail.trim()) {
      setErr("Vui lòng nhập Vị trí, Sinh viên và Email");
      return;
    }
    const email = studentEmail.trim();
    const emailRegex = /^[A-Za-z0-9._%+~-]+@gmail\.com$/i;
    if (!emailRegex.test(email)) {
      setErr("Email phải là Gmail hợp lệ (ví dụ: ten@gmail.com)");
      return;
    }
    if (!startDate || !endDate) {
      setErr("Vui lòng chọn Thời gian");
      return;
    }
    onCreate({
      title: title.trim(),
      student: student.trim(),
      studentEmail: email,
      school: school.trim() || undefined,
      major: major.trim() || undefined,
      status,
      startDate,
      endDate,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Thêm thực tập</h2>
        {err && <div style={{ color: "#dc3545", marginBottom: 8 }}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-row cols-2-1">
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Vị trí
              </label>
              <input
                id="title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="studentEmail">
                Email
              </label>
              <input
                id="studentEmail"
                type="email"
                className="form-input"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="name@gmail.com"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="student">
                Tên sinh viên
              </label>
              <input
                id="student"
                className="form-input"
                value={student}
                onChange={(e) => setStudent(e.target.value)}
              />
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
                Ngày bắt đầu
              </label>
              <input
                id="start"
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="end">
                Ngày kết thúc
              </label>
              <input
                id="end"
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
  const [err, setErr] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (!title.trim() || !student.trim() || !studentEmail.trim()) {
      setErr("Vui lòng nhập Vị trí, Sinh viên và Email");
      return;
    }
    const email = studentEmail.trim();
    const emailRegex = /^[A-Za-z0-9._%+~-]+@gmail\.com$/i;
    if (!emailRegex.test(email)) {
      setErr("Email phải là Gmail hợp lệ (ví dụ: ten@gmail.com)");
      return;
    }
    if (!startDate || !endDate) {
      setErr("Vui lòng chọn Thời gian");
      return;
    }
    onSave({
      ...data,
      title: title.trim(),
      student: student.trim(),
      studentEmail: email,
      school: school.trim() || undefined,
      major: major.trim() || undefined,
      status,
      startDate,
      endDate,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Sửa thông tin thực tập</h2>
        {err && <div style={{ color: "#dc3545", marginBottom: 8 }}>{err}</div>}
        <form onSubmit={onSubmit}>
          <div className="form-row cols-2-1">
            <div className="form-group">
              <label className="form-label">Vị trí</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="name@gmail.com"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sinh viên</label>
              <input
                className="form-input"
                value={student}
                onChange={(e) => setStudent(e.target.value)}
              />
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
              <label className="form-label">Ngày bắt đầu</label>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày kết thúc</label>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
