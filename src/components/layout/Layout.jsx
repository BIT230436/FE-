import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/Navbar";
import Sidebar from "./Sidebar";

// 👉 Import ảnh nền
import teamworkImage from "../../assets/Hinh-anh-ky-nang-lam-viec-nhom.jpg";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${teamworkImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Lớp phủ mờ để chữ dễ đọc */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)", // nền trắng mờ
          zIndex: 0,
        }}
      ></div>

      {/* Navbar */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar onMenuClick={handleMenuClick} />
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

        {/* Nội dung */}
        <main style={{ padding: 24 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              minHeight: "calc(100vh - 100px)",
              zIndex: 1,
              position: "relative",
            }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
