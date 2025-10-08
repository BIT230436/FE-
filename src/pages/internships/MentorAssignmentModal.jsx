import { useState, useEffect } from "react";
import { getInterns } from "../../services/internService";
import { getMentors, assignMentor, unassignMentor, getInternMentorAssignment } from "../../services/mentorService";

export default function MentorAssignmentModal({ internship, mentors, loadingMentors, onClose, onLoadMentors }) {
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (internship) {
      loadCurrentAssignment();
      onLoadMentors(); // Load mentors when modal opens
    }
  }, [internship]);

  async function loadCurrentAssignment() {
    if (!internship?.studentEmail) {
      setCurrentAssignment(null);
      return;
    }

    setLoadingAssignment(true);
    try {
      // Try to get intern by email first, then get their mentor assignment
      const internResponse = await getInterns({ q: internship.studentEmail });
      const interns = Array.isArray(internResponse?.items) ? internResponse.items : [];
      const foundIntern = interns.find(i => i.email === internship.studentEmail);

      if (foundIntern) {
        const assignment = await getInternMentorAssignment(foundIntern.id);
        setCurrentAssignment(assignment);
        if (assignment?.mentor) {
          setSelectedMentorId(assignment.mentor.id?.toString() || "");
        }
      }
    } catch (e) {
      console.error("loadCurrentAssignment error", e);
      setCurrentAssignment(null);
    } finally {
      setLoadingAssignment(false);
    }
  }

  const handleChangeMentor = (e) => {
    setSelectedMentorId(e.target.value);
    setMessage("");
    setError("");
  };

  const onAssignMentor = async () => {
    setMessage("");
    setError("");

    if (!selectedMentorId) {
      setError("Vui lòng chọn mentor");
      return;
    }

    try {
      setAssigning(true);

      // Find intern by email
      const internResponse = await getInterns({ q: internship.studentEmail });
      const interns = Array.isArray(internResponse?.items) ? internResponse.items : [];
      const foundIntern = interns.find(i => i.email === internship.studentEmail);

      if (!foundIntern) {
        setError("Không tìm thấy thông tin thực tập sinh");
        return;
      }

      await assignMentor({
        internId: foundIntern.id,
        mentorId: selectedMentorId
      });

      setMessage("Đã phân công mentor thành công!");
      await loadCurrentAssignment();
    } catch (e) {
      const backendMsg = e?.response?.data?.message;
      setError(backendMsg || "Phân công mentor thất bại. Vui lòng thử lại.");
    } finally {
      setAssigning(false);
    }
  };

  const onUnassignMentor = async () => {
    if (!currentAssignment?.mentor) {
      setError("Thực tập sinh này chưa được phân công mentor");
      return;
    }

    if (!confirm("Bạn có chắc muốn hủy phân công mentor này?")) {
      return;
    }

    try {
      setAssigning(true);
      setMessage("");
      setError("");

      // Find intern by email
      const internResponse = await getInterns({ q: internship.studentEmail });
      const interns = Array.isArray(internResponse?.items) ? internResponse.items : [];
      const foundIntern = interns.find(i => i.email === internship.studentEmail);

      if (foundIntern) {
        await unassignMentor(foundIntern.id);
        setMessage("Đã hủy phân công mentor thành công!");
        setCurrentAssignment(null);
        setSelectedMentorId("");
      }
    } catch (e) {
      const backendMsg = e?.response?.data?.message;
      setError(backendMsg || "Hủy phân công thất bại. Vui lòng thử lại.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Phân công Mentor cho {internship.student}</h2>

        {/* Current assignment status */}
        <div className="form-group" style={{ marginBottom: 20 }}>
          {loadingAssignment ? (
            <div>Đang tải thông tin phân công mentor…</div>
          ) : currentAssignment?.mentor ? (
            <div>
              <strong>Mentor hiện tại:</strong> {currentAssignment.mentor.fullName || currentAssignment.mentor.name} ({currentAssignment.mentor.email})
              <br />
              <strong>Ngày phân công:</strong>{" "}
              {currentAssignment.assignedAt
                ? new Date(currentAssignment.assignedAt).toLocaleString()
                : "-"}
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn btn-outline-danger"
                  onClick={onUnassignMentor}
                  disabled={assigning}
                >
                  Hủy phân công
                </button>
              </div>
            </div>
          ) : (
            <div>
              <strong>Trạng thái:</strong> Chưa được phân công mentor
            </div>
          )}
        </div>

        {/* Mentor selection */}
        <div className="form-group">
          <label className="form-label">Chọn Mentor</label>
          <select
            className="form-select"
            value={selectedMentorId}
            onChange={handleChangeMentor}
            disabled={loadingMentors}
          >
            <option value="">-- Chọn mentor --</option>
            {mentors.map((mentor) => {
              const id = (mentor.id ?? mentor.mentorId)?.toString();
              const name = mentor.fullName || mentor.name || `Mentor ${id}`;
              const email = mentor.email || mentor.username || "";
              return (
                <option key={id} value={id}>
                  {name} {email ? `• ${email}` : ""}
                </option>
              );
            })}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onAssignMentor}
            disabled={!selectedMentorId || assigning}
          >
            {assigning ? "Đang phân công..." : "Phân công Mentor"}
          </button>
        </div>

        {message && (
          <div style={{ color: "#28a745", marginTop: 8 }}>✅ {message}</div>
        )}
        {error && <div style={{ color: "#dc3545", marginTop: 8 }}>❌ {error}</div>}
      </div>
    </div>
  );
}
