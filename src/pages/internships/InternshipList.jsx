import { useState, useEffect } from "react";
import "../shared/list.css";

export default function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    // Mock data for now
    setTimeout(() => {
      setInternships([
        {
          id: 1,
          title: "Frontend Developer Intern",
          student: "Nguyễn Văn A",
          studentEmail: "vana@gmail.com",
          status: "active",
          startDate: "2024-01-15",
          endDate: "2024-06-15",
        },
        {
          id: 2,
          title: "Backend Developer Intern",
          student: "Trần Thị B",
          studentEmail: "thib@gmail.com",
          status: "completed",
          startDate: "2023-09-01",
          endDate: "2024-02-01",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th className="table-th">Vị trí</th>
              <th className="table-th">Sinh viên</th>
              <th className="table-th">Email</th>
              <th className="table-th">Trạng thái</th>
              <th className="table-th">Thời gian</th>
              <th className="table-th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((internship) => (
              <tr key={internship.id}>
                <td className="table-td">{internship.title}</td>
                <td className="table-td">{internship.student}</td>
                <td className="table-td">{internship.studentEmail}</td>
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
            ))}
          </tbody>
        </table>
      </div>
      {showCreate && (
        <CreateInternshipModal
          onClose={() => setShowCreate(false)}
          onCreate={(data) => {
            const newItem = { id: Date.now(), ...data };
            setInternships((prev) => [newItem, ...prev]);
            setShowCreate(false);
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
          onSave={(updated) => {
            setInternships((prev) =>
              prev.map((it) => (it.id === updated.id ? updated : it))
            );
            setEditing(null);
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
              <label className="form-label" htmlFor="title">Vị trí</label>
              <input
                id="title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="studentEmail">Email</label>
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
              <label className="form-label" htmlFor="student">Sinh viên</label>
              <input
                id="student"
                className="form-input"
                value={student}
                onChange={(e) => setStudent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Trạng thái</label>
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
            <button type="submit" className="btn btn-primary">
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
            <button type="submit" className="btn btn-primary">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
