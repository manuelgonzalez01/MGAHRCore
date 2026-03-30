import { Outlet } from "react-router-dom";
import Sidebar from "../../components/navigation/Sidebar";
import Topbar from "../../components/navigation/Topbar";
import "../../assets/styles/globals.css";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <Topbar />
      </header>

      <aside className="app-sidebar">
        <Sidebar />
      </aside>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
