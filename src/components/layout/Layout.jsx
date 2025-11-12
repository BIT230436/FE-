import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useState } from "react";
import teamworkImage from "../../assets/man-hinh-chinh.jpg";
import Chatbot from "../chatbot/Chatbot";
import "./Layout.css"; 

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      className="layout-root"
      style={{
        backgroundImage: `url(${teamworkImage})`,
        backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
      }}
    >
     
      <div className="layout-sidebar">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <main className={`layout-main${collapsed ? " collapsed" : ""}`}>
        <div className="layout-content">
          <Outlet />
        </div>
        <Chatbot />
      </main>
    </div>
  );
}
