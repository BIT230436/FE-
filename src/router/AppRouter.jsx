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
import MentorManagement from "../pages/hr/MentorManagement";
import ProjectManagement from "../pages/mentor/ProjectManagement";
import TaskManagement from "../pages/mentor/TaskManagement";
import OAuthCallback from "../pages/auth/OAuthCallback";
import MyContract from "../pages/students/MyContract";
import AllowanceHistory from "../pages/internships/AllowanceHistory";
import InternSchedule from "../pages/internships/InternshipSchedule"; // ✅ Lịch thực tập
import MyTasks from "../pages/internships/MyTasks"; // ✅ Công việc của tôi
import EvaluationForm from "../pages/mentor/EvaluationForm"; // ✅ Đánh giá thực tập sinh
import SupportRequests from "../pages/internships/SupportRequests";
import Reports from "../pages/hr/ReportManagement";
import ReportIntern from "../pages/internships/ReportIntern";
import ReviewSupportRequests from "../pages/hr/ReviewSupportRequests";
import AttendancePage from "../pages/internships/AttendancePage";
import LeaveRequestPage from "../pages/internships/LeaveRequestPage";

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
import AttendanceReport from "../pages/hr/AttendanceReport";
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
        {/* 🌐 Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />
        <Route path="/apply" element={<DocumentUpload />} />

        {/* 🔒 Private Routes */}
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

            {/* 🧑‍💼 ADMIN / HR */}
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
              path="/mentor/projects"
              element={
                <AccessGuard requiredRoles={["MENTOR", "ADMIN"]}>
                  <ProjectManagement />
                </AccessGuard>
              }
            />

            {/* ✅ Đánh giá thực tập sinh */}
            <Route
              path="/mentor/evaluation"
              element={
                <AccessGuard requiredRoles={["MENTOR", "ADMIN"]}>
                  <EvaluationForm />
                </AccessGuard>
              }
            />

            <Route
              path="/mentor/tasks"
              element={
                <AccessGuard requiredRoles={["MENTOR", "ADMIN"]}>
                  <TaskManagement />
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
            <Route
              path="/hr/departments/:programId"
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
            <Route
              path="/hr/attendance-report"
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <AttendanceReport />
                </AccessGuard>
              }
            />

            {/* 👤 USER */}
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

            {/* 🧑‍🎓 INTERN (Thực tập sinh) */}
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
            <Route
              path="/my-tasks"
              element={
                <AccessGuard requiredRoles={["INTERN"]}>
                  <MyTasks />
                </AccessGuard>
              }
            />
            <Route
              path="/support-requests"
              element={
                <AccessGuard requiredRoles={["INTERN"]}>
                  <SupportRequests />
                </AccessGuard>
              }
            />
            <Route
              path="/reports"
              element={
                <AccessGuard requiredRoles={["HR"]}>
                  <Reports />
                </AccessGuard>
              }
            />

            <Route
              path="/report-intern"
              element={
                <AccessGuard requiredRoles={["INTERN"]}>
                  <ReportIntern />
                </AccessGuard>
              }
            />

            <Route
              path="/hr/support-requests"
              element={
                <AccessGuard requiredRoles={["HR", "ADMIN"]}>
                  <ReviewSupportRequests />
                </AccessGuard>
              }
            />
            <Route
              path="/internship-attendance"
              element={
                <AccessGuard requiredRoles={["INTERN"]}>
                  <AttendancePage />
                </AccessGuard>
              }
            />
            <Route
              path="/internship-leave-requests"
              element={
                <AccessGuard requiredRoles={["INTERN"]}>
                  <LeaveRequestPage />
                </AccessGuard>
              }
            />
          </Route>
        </Route>

        {/* 🚫 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
