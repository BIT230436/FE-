import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Index";
import InternshipList from "../pages/internships/InternshipList";
import Users from "../pages/admin/Users";
import Permissions from "../pages/admin/Permissions";
import OAuthCallback from "../pages/auth/OAuthCallback";

// Layout & Guards
import AppLayout from "../components/layout/Layout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import RoleGuard from "../components/layout/RoleGuard";

import DocQueue from "../pages/hr/DocQueue";
import Profile from "../pages/students/Profile";
import DocumentUpload from "../pages/students/DocumentUpload";

export default function AppRouter() {
  return (
    <BrowserRouter>
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
            <Route
              path="/internships"
              element={
                <RoleGuard roles={["HR", "ADMIN"]}>
                  <InternshipList />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard roles={["ADMIN"]}>
                  <Users />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <RoleGuard roles={["ADMIN"]}>
                  <Permissions />
                </RoleGuard>
              }
            />
            <Route
              path="/hr/documents"
              element={
                <RoleGuard roles={["HR", "ADMIN"]}>
                  <DocQueue />
                </RoleGuard>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route 
              path="/upload-documents" 
              element={
                <RoleGuard roles={["USER"]}>
                  <DocumentUpload />
                </RoleGuard>
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
