import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Index";
import InternshipList from "../pages/internships/InternshipList";
import Users from "../pages/admin/Users";
import Permissions from "../pages/admin/Permissions";
import MentorManagement from "../pages/mentor/MentorManagement";
import OAuthCallback from "../pages/auth/OAuthCallback";
import MyContract from "../pages/students/MyContract";
import AllowanceHistory from "../pages/internships/AllowanceHistory";
import InternSchedule from "../pages/internships/InternshipSchedule"; // ✅ Thêm dòng này

// Layout & Guards
import AppLayout from "../components/layout/Layout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import AccessGuard from "../components/layout/AccessGuard";

import DocQueue from "../pages/hr/DocQueue";
import ContractUpload from "../pages/hr/ContractUpload";
import ContractList from "../pages/hr/ContractList";
import InternshipProgramList from "../pages/hr/InternshipProgramList";
import DepartmentManagement from "../pages/hr/DepartmentManagement";
import AllowanceManagement from "../pages/hr/AllowanceManagement";
import Profile from "../pages/students/Profile";
import DocumentUpload from "../pages/students/DocumentUpload";
import MyDocuments from "../pages/students/MyDocuments";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />
        <Route path="/apply" element={<DocumentUpload />} />

        {/* Private */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* ✅ Thực tập */}
            <Route
              path="/internships"
              element={
                <AccessGuard requiredPermissions={["VIEW_INTERNSHIPS"]}>
                  <InternshipList />
                </AccessGuard>
              }
            />

            {/* ✅ Lịch thực tập */}
            <Route
              path="/intern-schedule"
              element={
                <AccessGuard requiredRoles={["INTERN", "HR", "ADMIN"]}>
                  <InternSchedule />
                </AccessGuard>
              }
            />

            {/* ADMIN / HR */}
            <Route
              path="/admin/users"
              element={
                <AccessGuard requiredPermissions={["MANAGE_USERS"]}>
                  <Users />
                </AccessGuard>
              }
            />
            <Route
              path="/admin/mentors"
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <MentorManagement />
                </AccessGuard>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <AccessGuard requiredPermissions={["MANAGE_PERMISSIONS"]}>
                  <Permissions />
                </AccessGuard>
              }
            />
            <Route
              path="/hr/documents"
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <DocQueue />
                </AccessGuard>
              }
            />
            <Route
              path="/hr/contract-upload"
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <ContractUpload />
                </AccessGuard>
              }
            />
            <Route
              path="/hr/contract-list"
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <ContractList />
                </AccessGuard>
              }
            />
            <Route
              path="/hr/internship-programs"
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <InternshipProgramList />
                </AccessGuard>
              }
            />

            {/* 🔴 XÓA ROUTE CŨ: path="/hr/departments" 
                Nếu bạn đã loại bỏ chế độ quản lý chung, route này không cần thiết nữa.
                Nếu bạn vẫn cần nó cho menu, hãy giữ lại nó, nhưng thêm route dynamic sau.
            */}

            {/* 🟢 THÊM ROUTE DYNAMIC CHO CHI TIẾT PHÒNG BAN THEO CHƯƠNG TRÌNH */}
            <Route
              path="/hr/departments/:programId" // <-- Đã thêm tham số :programId
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <DepartmentManagement />
                </AccessGuard>
              }
            />

            <Route
              path="/hr/allowances"
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <AllowanceManagement />
                </AccessGuard>
              }
            />

            {/* USER */}
            <Route
              path="/upload-documents"
              element={
                <AccessGuard requiredRoles={["USER"]}>
                  <DocumentUpload />
                </AccessGuard>
              }
            />
            <Route
              path="/my-documents"
              element={
                <AccessGuard requiredPermissions={[]}>
                  <MyDocuments />
                </AccessGuard>
              }
            />
            <Route
              path="/my-contract"
              element={
                <AccessGuard requiredRoles={["INTERN"]}>
                  <MyContract />
                </AccessGuard>
              }
            />
            <Route
              path="/my-allowance-history"
              element={
                <AccessGuard requiredRoles={["INTERN"]}>
                  <AllowanceHistory />
                </AccessGuard>
              }
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
