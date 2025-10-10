import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

// 👉 Import ảnh nền
import teamworkImage from "../../assets/man-hinh-chinh.jpg";

export default function Layout() {
  return (
    <div
      style={{
        minHeight: "10vh",
        backgroundImage: `url(${teamworkImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        display: "flex", // để sidebar và main nằm cạnh nhau
      }}
    >
      {/* Lớp phủ mờ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "10%",
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.8)", // nền trắng mờ
          zIndex: 0,
        }}
      ></div>

      {/* Sidebar tĩnh bên trái */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <Sidebar />
      </div>

      {/* Nội dung chính */}
      <main
        style={{
          flex: 1,
          marginLeft: "250px", // chừa khoảng cho sidebar
          padding: 24,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            minHeight: "calc(100vh - 48px)", // để khung chính cân đối
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
