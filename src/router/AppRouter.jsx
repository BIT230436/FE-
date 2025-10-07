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
import PermissionGuard from "../components/layout/PermissionGuard";

import DocQueue from "../pages/hr/DocQueue";
import ContractUpload from "../pages/hr/ContractUpload";
import Profile from "../pages/students/Profile";
import DocumentUpload from "../pages/students/DocumentUpload";
import MyDocuments from "../pages/students/MyDocuments";

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
                <PermissionGuard requiredPermissions={["VIEW_INTERNSHIPS"]}> 
                  <InternshipList />
                </PermissionGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PermissionGuard requiredPermissions={["MANAGE_USERS"]}>
                  <Users />
                </PermissionGuard>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <PermissionGuard requiredPermissions={["MANAGE_PERMISSIONS"]}>
                  <Permissions />
                </PermissionGuard>
              }
            />
            <Route
              path="/hr/documents"
              element={
                <PermissionGuard requiredPermissions={["DOC_APPROVE"]}>
                  <DocQueue />
                </PermissionGuard>
              }
            />
            <Route
              path="/hr/contract-upload"
              element={
                <RoleGuard roles={["HR", "ADMIN"]}>
                  <ContractUpload />
                </RoleGuard>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route 
              path="/upload-documents" 
              element={
                <PermissionGuard requiredPermissions={[]}>  
                  <DocumentUpload />
                </PermissionGuard>  
              } 
            />
            <Route 
              path="/my-documents" 
              element={
                <PermissionGuard requiredPermissions={[]}>
                  <MyDocuments />
                </PermissionGuard>
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
