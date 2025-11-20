import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../../services/profileService";
import { useAuthStore } from "../../store/authStore";
import "./profile.css";

export default function Profile() {
  const { user, setAuth } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile(user);
        console.log('📦 Profile data received:', p); // Debug
        setProfile(p);
        setEditedProfile(p);
      } catch (e) {
        console.error('❌ Error fetching profile:', e);
        setErr(e?.response?.data?.message || "Không tải được dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploadingAvatar(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setAvatarUrl(imageUrl);

      const updatedUser = { ...user, avatar: imageUrl };
      const currentStorage = localStorage.getItem('auth-storage');
      const token = currentStorage ? JSON.parse(currentStorage).state.token : null;
      setAuth(updatedUser, token);

      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // ✅ Use the profileService instead of fetch
      const result = await updateMyProfile({
        fullName: editedProfile.fullName,
        email: editedProfile.email,
        university: editedProfile.university,
        major: editedProfile.major,
        phone: editedProfile.phone,
      });

      // ✅ Get token for auth update
      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')).state.token
        : null;

      // ✅ Cập nhật state local
      setProfile(editedProfile);

      // ✅ Cập nhật auth store nếu thay đổi thông tin cơ bản
      if (editedProfile.fullName !== user.fullName || editedProfile.email !== user.email) {
        const updatedUser = {
          ...user,
          fullName: editedProfile.fullName,
          email: editedProfile.email
        };
        setAuth(updatedUser, token);
      }

      setIsEditing(false);
      alert('✅ Cập nhật thông tin thành công!');

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Lưu thông tin thất bại: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <div className="page-container">Đang tải…</div>;
  if (err) return <div className="page-container error-text">{err}</div>;

  if (!user || !profile) {
    return (
      <div className="page-container">
        <h2>Không tìm thấy thông tin người dùng</h2>
        <p>Vui lòng <a href="/login">đăng nhập lại</a></p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        {/* Avatar */}
        <div className="avatar-wrapper">
          <div
            onClick={() => document.getElementById('avatar-upload').click()}
            className={`avatar ${avatarUrl ? 'avatar--has-image' : ''}`}
            style={{ backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none' }}
          >
            {!avatarUrl && (user?.fullName?.charAt(0)?.toUpperCase() || "U")}

            <div className="avatar-overlay">
              {uploadingAvatar ? "Đang tải..." : "Thay đổi ảnh"}
            </div>
          </div>

          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden-input"
          />
        </div>
        <div>
          <h1 className="profile-title m-0">
            {profile?.fullName || user?.fullName || "Người dùng"}
          </h1>
          <p className="user-subtitle">
            {profile?.role || user?.role || "Unknown"} • {profile?.email || user?.email || "No email"}
          </p>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="upload-card mb-16">
        {/* Header with Edit button */}
        <div className="section-header">
          <h3 className="profile-section-title">Thông tin cá nhân</h3>
          <div className="button-group">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="p-btn p-btn-primary"
              >
                ✏️ Chỉnh sửa
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="p-btn p-btn-secondary"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-btn p-btn-success"
                >
                  {saving ? "Đang lưu..." : "✓ Lưu"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="field-grid">
          <EditableField
            label="Họ tên"
            value={isEditing ? editedProfile?.fullName : profile?.fullName}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('fullName', value)}
          />
          <EditableField
            label="Email"
            value={isEditing ? editedProfile?.email : profile?.email}
            isEditing={isEditing}
            onChange={(value) => handleInputChange('email', value)}
            type="email"
          />
          <Field label="Vai trò" value={profile?.role} />

          {/* ✅ Hiển thị thông tin theo vai trò */}
          {(profile?.role === "USER" || profile?.role === "INTERN") && (
            <>
              <Field label="Trạng thái" value={profile?.status || profile?.internStatus} />

              {/* ✅ Trường học - từ profile.university */}
              <EditableField
                label="Trường"
                value={isEditing ? editedProfile?.university : profile?.university}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('university', value)}
              />

              {/* ✅ Ngành học - từ profile.major */}
              <EditableField
                label="Ngành"
                value={isEditing ? editedProfile?.major : profile?.major}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('major', value)}
              />

              {/* ✅ Số điện thoại */}
              <EditableField
                label="Số điện thoại"
                value={isEditing ? editedProfile?.phone : profile?.phone}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('phone', value)}
              />

              {/* ✅ Mentor - từ profile.mentorName */}
              <Field
                label="Mentor"
                value={profile?.mentorName || "Chưa phân công"}
              />

              {/* ✅ Thời gian thực tập - từ profile.startDate và profile.endDate */}
              <Field
                label="Thời gian thực tập"
                value={formatRange(profile?.startDate, profile?.endDate)}
              />

              {/* ✅ Chương trình/Project */}
              {profile?.programTitle && (
                <Field
                  label="Chương trình"
                  value={profile?.programTitle}
                />
              )}
            </>
          )}

          {/* ✅ HR: Chỉ hiển thị Chức vụ */}
          {profile?.role === "HR" && (
            <>
              <Field label="Chức vụ" value={profile?.position} />
            </>
          )}

          {/* ✅ ADMIN: Hiển thị Chức vụ và Quyền hạn */}
          {profile?.role === "ADMIN" && (
            <>
              <Field label="Chức vụ" value={profile?.position} />
              <Field label="Quyền hạn" value={profile?.permissions} />
            </>
          )}

          {/* ✅ MENTOR: Hiển thị Phòng ban và Chức vụ */}
          {profile?.role === "MENTOR" && (
            <>
              <Field label="Phòng ban" value={profile?.department || "Chưa phân công"} />

            </>
          )}

          {(profile?.role === "HR" || profile?.role === "ADMIN") && (
            <>

              <EditableField
                label="Chức vụ"
                value={isEditing ? editedProfile?.position : profile?.position}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('position', value)}
              />

              {profile?.role === "ADMIN" && (
                <Field label="Quyền hạn" value={profile?.permissions} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div className="field-value">{value || "-"}</div>
    </div>
  );
}

function EditableField({ label, value, isEditing, onChange, type = "text" }) {
  if (!isEditing) {
    return (
      <div>
        <div className="field-label">{label}</div>
        <div className="field-value">{type === "date" ? formatDate(value) : (value || "-")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="field-label">{label}</div>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}

function formatDate(s) {
  if (!s) return "-";
  try {
    const d = new Date(s);
    return d.toLocaleDateString('vi-VN');
  } catch {
    return s;
  }
}

function formatRange(a, b) {
  if (!a && !b) return "-";
  const start = formatDate(a);
  const end = formatDate(b);
  if (start === "-" && end === "-") return "-";
  if (start === "-") return `Đến ${end}`;
  if (end === "-") return `Từ ${start}`;
  return `${start} → ${end}`;
}