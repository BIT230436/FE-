import { useEffect, useState } from "react";
import { getMyProfile } from "../../services/profileService";
import { useAuthStore } from "../../store/authStore";
import "./Profile.css";

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
        setProfile(p);
        setEditedProfile(p);
      } catch (e) {
        setErr(e?.response?.data?.message || "Không tải được dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Avatar upload handler
  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploadingAvatar(true);

    // TODO(stagewise): Replace with actual API call to upload avatar
    // For now, we'll use FileReader to create a local URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setAvatarUrl(imageUrl);
      
      // Update user data in store
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
      // TODO(stagewise): Replace with actual API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      setProfile(editedProfile);
      
      // Update user data in auth store if basic info changed
      if (editedProfile.fullName !== user.fullName || editedProfile.email !== user.email) {
        const updatedUser = {
          ...user,
          fullName: editedProfile.fullName,
          email: editedProfile.email
        };
        const currentStorage = localStorage.getItem('auth-storage');
        const token = currentStorage ? JSON.parse(currentStorage).state.token : null;
        setAuth(updatedUser, token);
      }
      
      setIsEditing(false);
    } catch (error) {
      alert('Lưu thông tin thất bại. Vui lòng thử lại.');
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
  
  // Debug: Kiểm tra dữ liệu user
  console.log('Current user:', user);
  console.log('Profile data:', profile);
  
  // Nếu không có user data, hiển thị thông báo
  if (!user) {
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
            
            {/* Overlay khi hover */}
            <div className="avatar-overlay">
              {uploadingAvatar ? "Đang tải..." : "Thay đổi ảnh"}
            </div>
          </div>
          
          {/* Hidden file input */}
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
            {user?.fullName || "Người dùng"}
          </h1>
          <p className="user-subtitle">
            {user?.role || "Unknown"} • {user?.email || "No email"}
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
          
          {/* Hiển thị thông tin theo vai trò */}
          {user?.role === "USER" && (
            <>
              <Field label="Trạng thái" value={profile?.status} />
              <EditableField 
                label="Trường" 
                value={isEditing ? editedProfile?.university : profile?.university}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('university', value)}
              />
              <EditableField 
                label="Ngành" 
                value={isEditing ? editedProfile?.major : profile?.major}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('major', value)}
              />
              <Field label="Ngày ứng tuyển" value={formatDate(profile?.appliedDate)} />
              <EditableField 
                label="Thời gian mong muốn" 
                value={isEditing ? editedProfile?.expectedStartDate : profile?.expectedStartDate}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('expectedStartDate', value)}
                type="date"
              />
            </>
          )}
          
          {user?.role === "INTERN" && (
            <>
              <Field label="Trạng thái" value={profile?.status} />
              <EditableField 
                label="Trường" 
                value={isEditing ? editedProfile?.university : profile?.university}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('university', value)}
              />
              <EditableField 
                label="Ngành" 
                value={isEditing ? editedProfile?.major : profile?.major}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('major', value)}
              />
              <Field label="Mentor" value={profile?.mentorName || "-"} />
              <Field label="Thời gian thực tập" value={formatRange(profile?.startDate, profile?.endDate)} />
            </>
          )}
          
          {(user?.role === "HR" || user?.role === "ADMIN") && (
            <>
              <EditableField 
                label="Phòng ban" 
                value={isEditing ? editedProfile?.department : profile?.department}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('department', value)}
              />
              <EditableField 
                label="Chức vụ" 
                value={isEditing ? editedProfile?.position : profile?.position}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('position', value)}
              />
              <EditableField 
                label="Ngày vào làm" 
                value={isEditing ? editedProfile?.joinDate : profile?.joinDate}
                isEditing={isEditing}
                onChange={(value) => handleInputChange('joinDate', value)}
                type="date"
              />
              {user?.role === "ADMIN" && (
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
  const d = new Date(s);
  return d.toLocaleDateString();
}
function formatRange(a, b) {
  if (!a && !b) return "-";
  return [formatDate(a), formatDate(b)].filter(Boolean).join(" → ");
}

