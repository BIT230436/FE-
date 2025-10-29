import { useState } from "react";
import { toast } from "react-toastify";
import "./EvaluationForm.css";

export default function EvaluationForm() {
  const [form, setForm] = useState({
    internName: "",
    technical: "",
    communication: "",
    proactive: "",
    discipline: "",
    attitude: "",
    comment: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu đánh giá:", form);
    toast.success("Đánh giá đã được lưu tạm thời (chưa có backend)");
  };

  return (
    <div className="evaluation-container">
      <h2>Đánh giá thực tập sinh</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên thực tập sinh</label>
          <input
            type="text"
            name="internName"
            value={form.internName}
            onChange={handleChange}
            required
          />
        </div>

        {[
          { name: "technical", label: "Kỹ thuật" },
          { name: "communication", label: "Giao tiếp" },
          { name: "proactive", label: "Chủ động" },
          { name: "discipline", label: "Kỷ luật" },
          { name: "attitude", label: "Thái độ" },
        ].map(({ name, label }) => (
          <div key={name} className="form-group">
            <label>{label}</label>
            <input
              type="number"
              name={name}
              min="1"
              max="10"
              value={form[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <div className="form-group">
          <label>Ghi chú tổng quát</label>
          <textarea
            name="comment"
            rows="4"
            value={form.comment}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" className="submit-btn">
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
}
